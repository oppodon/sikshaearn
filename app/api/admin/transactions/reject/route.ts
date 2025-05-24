import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { transactionId, reason } = await req.json()

    if (!transactionId || !reason) {
      return NextResponse.json(
        { success: false, error: "Transaction ID and rejection reason are required" },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const transaction = await Transaction.findById(transactionId)

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "completed") {
      return NextResponse.json({ success: false, error: "Cannot reject completed transaction" }, { status: 400 })
    }

    // Update transaction status
    transaction.status = "rejected"
    transaction.rejectionReason = reason
    await transaction.save()

    return NextResponse.json({
      success: true,
      message: "Transaction rejected successfully",
    })
  } catch (error) {
    console.error("Error rejecting transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to reject transaction" }, { status: 500 })
  }
}
