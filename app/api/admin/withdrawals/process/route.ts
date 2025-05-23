import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Withdrawal from "@/models/Withdrawal"
import AffiliateEarning from "@/models/AffiliateEarning"
import User from "@/models/User"
import { BalanceService } from "@/lib/balance-service"
import mongoose from "mongoose"
import { sendWithdrawalStatusEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

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

        // Update withdrawal status
        withdrawal.status = "completed"
        withdrawal.processedAt = new Date()
        withdrawal.processedBy = session.user.id
        withdrawal.transactionId = transactionId

        await withdrawal.save({ session: mongoSession })

        // Update earnings status to "withdrawn"
        await AffiliateEarning.updateMany(
          { withdrawalId: withdrawal._id },
          { status: "withdrawn" },
          { session: mongoSession },
        )

        // Update user's balance
        await User.findByIdAndUpdate(
          withdrawal.user._id,
          {
            $inc: {
              pendingWithdrawals: -withdrawal.amount,
              totalWithdrawn: withdrawal.amount,
            },
          },
          { session: mongoSession },
        )

        // Complete the withdrawal in the balance service
        await BalanceService.completeWithdrawal({
          userId: withdrawal.user._id,
          amount: withdrawal.amount,
          withdrawalId: withdrawal._id,
        })

        // Send email notification
        if (withdrawal.user.email) {
          await sendWithdrawalStatusEmail({
            email: withdrawal.user.email,
            name: withdrawal.user.name || "User",
            status: "approved",
            amount: withdrawal.amount,
            transactionId,
            method: withdrawal.method,
            date: new Date().toISOString(),
          })
        }
      } else if (action === "reject") {
        if (!rejectionReason) {
          return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 })
        }

        // Update withdrawal status
        withdrawal.status = "rejected"
        withdrawal.processedAt = new Date()
        withdrawal.processedBy = session.user.id
        withdrawal.rejectionReason = rejectionReason

        await withdrawal.save({ session: mongoSession })

        // Update earnings status back to "available"
        await AffiliateEarning.updateMany(
          { withdrawalId: withdrawal._id },
          { status: "available", withdrawalId: null },
          { session: mongoSession },
        )

        // Update user's balance
        await User.findByIdAndUpdate(
          withdrawal.user._id,
          { $inc: { pendingWithdrawals: -withdrawal.amount } },
          { session: mongoSession },
        )

        // Send email notification
        if (withdrawal.user.email) {
          await sendWithdrawalStatusEmail({
            email: withdrawal.user.email,
            name: withdrawal.user.name || "User",
            status: "rejected",
            amount: withdrawal.amount,
            reason: rejectionReason,
            method: withdrawal.method,
            date: new Date().toISOString(),
          })
        }
      }

      await mongoSession.commitTransaction()
      mongoSession.endSession()

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
      mongoSession.endSession()
      throw error
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    return NextResponse.json({ message: "Failed to process withdrawal" }, { status: 500 })
  }
}
