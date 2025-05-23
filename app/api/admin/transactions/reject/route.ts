import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { transactionId, reason } = await req.json()

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    // Get transaction details
    const transaction = await Transaction.findById(transactionId)

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "rejected") {
      return NextResponse.json({ success: false, error: "Transaction already rejected" }, { status: 400 })
    }

    // Update transaction status
    transaction.status = "rejected"
    transaction.rejectedAt = new Date()
    transaction.rejectedBy = session.user.id
    transaction.rejectionReason = reason || "No reason provided"
    await transaction.save()

    return NextResponse.json({ success: true, message: "Transaction rejected successfully" })
  } catch (error) {
    console.error("Error rejecting transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reject transaction. Please try again." },
      { status: 500 },
    )
  }
}
