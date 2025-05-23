import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Withdrawal from "@/models/Withdrawal"
import AffiliateEarning from "@/models/AffiliateEarning"
import mongoose from "mongoose"

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
    const withdrawal = await Withdrawal.findById(withdrawalId)

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
