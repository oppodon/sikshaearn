import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Withdrawal, Balance } from "@/lib/models"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const { withdrawalId, action, transactionId, rejectionReason } = await req.json()

    if (!withdrawalId || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    // Find the withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user", "name email")

    if (!withdrawal) {
      return NextResponse.json({ message: "Withdrawal not found" }, { status: 404 })
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ message: `Withdrawal is already ${withdrawal.status}` }, { status: 400 })
    }

    // Try with transactions first, fall back to non-transactional if not supported
    try {
      const mongoSession = await mongoose.startSession()
      mongoSession.startTransaction()

      try {
        await processWithdrawal(withdrawal, action, transactionId, rejectionReason, session.user.id, mongoSession)
        await mongoSession.commitTransaction()
        console.log("✅ Processed with transactions")
      } catch (error) {
        await mongoSession.abortTransaction()
        throw error
      } finally {
        mongoSession.endSession()
      }
    } catch (error: any) {
      // If transaction fails due to replica set requirement, fall back to non-transactional
      if (error.code === 20 || error.codeName === "IllegalOperation") {
        console.log("⚠️ Transactions not supported, falling back to non-transactional processing")
        await processWithdrawal(withdrawal, action, transactionId, rejectionReason, session.user.id, null)
      } else {
        throw error
      }
    }

    return NextResponse.json({
      message: `Withdrawal ${action === "approve" ? "approved" : "rejected"} successfully`,
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        processedAt: withdrawal.processedAt,
      },
    })
  } catch (error) {
    console.error("❌ Error processing withdrawal:", error)
    return NextResponse.json({ message: "Failed to process withdrawal" }, { status: 500 })
  }
}

async function processWithdrawal(
  withdrawal: any,
  action: string,
  transactionId: string,
  rejectionReason: string,
  userId: string,
  mongoSession: any,
) {
  if (action === "approve") {
    if (!transactionId) {
      throw new Error("Transaction ID is required for approval")
    }

    console.log(`✅ Approving withdrawal ${withdrawal._id} for ₹${withdrawal.amount}`)

    // Update withdrawal status
    withdrawal.status = "completed"
    withdrawal.processedAt = new Date()
    withdrawal.processedBy = userId
    withdrawal.transactionId = transactionId

    if (mongoSession) {
      await withdrawal.save({ session: mongoSession })
    } else {
      await withdrawal.save()
    }

    // Update user's balance - move from processing to withdrawn
    const balanceQuery = mongoSession
      ? Balance.findOne({ user: withdrawal.user._id }).session(mongoSession)
      : Balance.findOne({ user: withdrawal.user._id })

    const balance = await balanceQuery

    if (balance) {
      const processingAmount = Number(balance.processing) || 0
      const withdrawnAmount = Number(balance.withdrawn) || 0

      balance.processing = Math.max(0, processingAmount - withdrawal.amount)
      balance.withdrawn = withdrawnAmount + withdrawal.amount
      balance.lastSyncedAt = new Date()

      if (mongoSession) {
        await balance.save({ session: mongoSession })
      } else {
        await balance.save()
      }

      console.log(`💰 Updated balance - Processing: ₹${balance.processing}, Withdrawn: ₹${balance.withdrawn}`)
    }

    console.log(`✅ Withdrawal approved successfully`)
  } else if (action === "reject") {
    if (!rejectionReason) {
      throw new Error("Rejection reason is required")
    }

    console.log(`❌ Rejecting withdrawal ${withdrawal._id}: ${rejectionReason}`)

    // Update withdrawal status
    withdrawal.status = "rejected"
    withdrawal.processedAt = new Date()
    withdrawal.processedBy = userId
    withdrawal.rejectionReason = rejectionReason

    if (mongoSession) {
      await withdrawal.save({ session: mongoSession })
    } else {
      await withdrawal.save()
    }

    // Update user's balance - move from processing back to available
    const balanceQuery = mongoSession
      ? Balance.findOne({ user: withdrawal.user._id }).session(mongoSession)
      : Balance.findOne({ user: withdrawal.user._id })

    const balance = await balanceQuery

    if (balance) {
      const processingAmount = Number(balance.processing) || 0
      const availableAmount = Number(balance.available) || 0

      balance.processing = Math.max(0, processingAmount - withdrawal.amount)
      balance.available = availableAmount + withdrawal.amount
      balance.lastSyncedAt = new Date()

      if (mongoSession) {
        await balance.save({ session: mongoSession })
      } else {
        await balance.save()
      }

      console.log(`💰 Restored balance - Available: ₹${balance.available}, Processing: ₹${balance.processing}`)
    }

    console.log(`❌ Withdrawal rejected successfully`)
  }
}
