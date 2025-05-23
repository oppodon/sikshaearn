import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import User from "@/models/User"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get transaction with package details
    const transaction = await Transaction.findById(params.id)
      .populate("package", "title description thumbnail price")
      .lean()

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Verify that the transaction belongs to the user or the user is an admin
    if (transaction.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user details for admin view
    if (session.user.role === "admin") {
      const user = await User.findById(transaction.user).select("name email").lean()
      transaction.userName = user?.name || "Unknown"
      transaction.userEmail = user?.email || "Unknown"
    }

    return NextResponse.json({ success: true, transaction }, { status: 200 })
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transaction. Please try again." },
      { status: 500 },
    )
  }
}
