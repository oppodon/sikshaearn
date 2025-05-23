import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isValidObjectId } from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid transaction ID" }, { status: 400 })
    }

    // Find transaction
    const transaction = await Transaction.findById(id).populate("package", "title slug price").lean()

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Verify that the transaction belongs to the user or user is admin
    if (transaction.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ success: true, transaction }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch transaction" }, { status: 500 })
  }
}
