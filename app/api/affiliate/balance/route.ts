import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Balance, BalanceTransaction } from "@/lib/models"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    console.log("🔍 Fetching balance for user:", session.user.id)

    const userId = session.user.id

    // Get balance with proper null handling
    let balance = await Balance.findOne({ user: userId })

    if (!balance) {
      // Create balance if it doesn't exist
      balance = await Balance.create({
        user: userId,
        available: 0,
        pending: 0,
        processing: 0,
        withdrawn: 0,
        lastSyncedAt: new Date(),
      })
      console.log("✅ Created new balance for user:", userId)
    }

    // Ensure all values are numbers, not null/undefined
    const safeBalance = {
      available: Number(balance.available) || 0,
      pending: Number(balance.pending) || 0,
      processing: Number(balance.processing) || 0,
      withdrawn: Number(balance.withdrawn) || 0,
    }

    // Get recent transactions
    const recentTransactions = await BalanceTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean()

    console.log("💰 Safe balance values:", safeBalance)

    const response = {
      available: safeBalance.available,
      pending: safeBalance.pending,
      processing: safeBalance.processing,
      withdrawn: safeBalance.withdrawn,
      total: safeBalance.available + safeBalance.pending + safeBalance.processing + safeBalance.withdrawn,
      recentTransactions: recentTransactions || [],
    }

    console.log("📤 Returning balance response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching balance:", error)
    return NextResponse.json(
      {
        available: 0,
        pending: 0,
        processing: 0,
        withdrawn: 0,
        total: 0,
        recentTransactions: [],
        error: String(error),
      },
      { status: 500 },
    )
  }
}
