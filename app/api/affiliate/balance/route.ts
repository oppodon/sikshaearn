import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    console.log("Connected to MongoDB for balance check")

    // Get user ID from session
    const userId = session.user.id
    console.log(`Fetching balance for user: ${userId}`)

    // Get balance
    const balance = await Balance.findOne({ user: userId })
    console.log("User balance:", balance)

    if (!balance) {
      return NextResponse.json({
        available: 0,
        pending: 0,
        processing: 0,
        withdrawn: 0,
        total: 0,
      })
    }

    // Get recent transactions
    const recentTransactions = await BalanceTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean()

    console.log(`Found ${recentTransactions.length} recent transactions`)

    return NextResponse.json({
      available: balance.available || 0,
      pending: balance.pending || 0,
      processing: balance.processing || 0,
      withdrawn: balance.withdrawn || 0,
      total: (balance.available || 0) + (balance.pending || 0) + (balance.processing || 0) + (balance.withdrawn || 0),
      recentTransactions,
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ message: "Failed to fetch balance", error: String(error) }, { status: 500 })
  }
}
