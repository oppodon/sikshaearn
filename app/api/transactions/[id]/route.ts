import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import { isValidObjectId } from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid transaction ID" }, { status: 400 })
    }

    // Find transaction with populated package data
    const transaction = await Transaction.findById(id)
      .populate('package', 'title slug price')
      .lean()

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Get session to check if user owns this transaction (optional for security)
    const session = await getServerSession(authOptions)
    
    // If user is logged in, verify they own this transaction
    if (session && transaction.user.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ success: true, transaction }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}