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

    // Start a session for transaction
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      if (action === "approve") {
        if (!transactionId) {
          return NextResponse.json({ message: "Transaction ID is required for approval" }, { status: 400 })
        }

        console.log(`✅ Approving withdrawal ${withdrawalId} for ₹${withdrawal.amount}`)

        // Update withdrawal status
        withdrawal.status = "completed"
        withdrawal.processedAt = new Date()
        withdrawal.processedBy = session.user.id
        withdrawal.transactionId = transactionId

        await withdrawal.save({ session: mongoSession })

        // Update user's balance - move from processing to withdrawn
        const balance = await Balance.findOne({ user: withdrawal.user._id }).session(mongoSession)

        if (balance) {
          const processingAmount = Number(balance.processing) || 0
          const withdrawnAmount = Number(balance.withdrawn) || 0

          balance.processing = Math.max(0, processingAmount - withdrawal.amount)
          balance.withdrawn = withdrawnAmount + withdrawal.amount
          balance.lastSyncedAt = new Date()

          await balance.save({ session: mongoSession })

          console.log(`💰 Updated balance - Processing: ₹${balance.processing}, Withdrawn: ₹${balance.withdrawn}`)
        }

        console.log(`✅ Withdrawal approved successfully`)
      } else if (action === "reject") {
        if (!rejectionReason) {
          return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 })
        }

        console.log(`❌ Rejecting withdrawal ${withdrawalId}: ${rejectionReason}`)

        // Update withdrawal status
        withdrawal.status = "rejected"
        withdrawal.processedAt = new Date()
        withdrawal.processedBy = session.user.id
        withdrawal.rejectionReason = rejectionReason

        await withdrawal.save({ session: mongoSession })

        // Update user's balance - move from processing back to available
        const balance = await Balance.findOne({ user: withdrawal.user._id }).session(mongoSession)

        if (balance) {
          const processingAmount = Number(balance.processing) || 0
          const availableAmount = Number(balance.available) || 0

          balance.processing = Math.max(0, processingAmount - withdrawal.amount)
          balance.available = availableAmount + withdrawal.amount
          balance.lastSyncedAt = new Date()

          await balance.save({ session: mongoSession })

          console.log(`💰 Restored balance - Available: ₹${balance.available}, Processing: ₹${balance.processing}`)
        }

        console.log(`❌ Withdrawal rejected successfully`)
      }

      await mongoSession.commitTransaction()

      return NextResponse.json({
        message: `Withdrawal ${action === "approve" ? "approved" : "rejected"} successfully`,
        withdrawal: {
          id: withdrawal._id,
          status: withdrawal.status,
          processedAt: withdrawal.processedAt,
        },
      })
    } catch (error) {
      await mongoSession.abortTransaction()
      throw error
    } finally {
      mongoSession.endSession()
    }
  } catch (error) {
    console.error("❌ Error processing withdrawal:", error)
    return NextResponse.json({ message: "Failed to process withdrawal" }, { status: 500 })
  }
}
