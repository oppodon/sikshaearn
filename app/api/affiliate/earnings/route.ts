import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, BalanceTransaction } from "@/lib/models"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const userId = session.user.id

    // Get all commission earnings with details
    const earnings = await BalanceTransaction.find({
      user: userId,
      type: "credit",
      category: "commission",
    })
      .sort({ createdAt: -1 })
      .lean()

    // Format earnings with detailed information
    const formattedEarnings = earnings.map((earning) => ({
      id: earning._id,
      amount: earning.amount,
      tier: earning.tier,
      description: earning.description,
      packageTitle: earning.metadata?.packageTitle || "Unknown Package",
      customerName: earning.metadata?.customerName || "Unknown Customer",
      customerEmail: earning.metadata?.customerEmail || "",
      commissionRate: earning.metadata?.commissionRate || 0,
      date: earning.createdAt,
      status: earning.status,
    }))

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)
    const tier1Earnings = earnings.filter((e) => e.tier === 1).reduce((sum, earning) => sum + earning.amount, 0)
    const tier2Earnings = earnings.filter((e) => e.tier === 2).reduce((sum, earning) => sum + earning.amount, 0)

    console.log(`📊 Earnings summary for user ${userId}:`, {
      total: totalEarnings,
      tier1: tier1Earnings,
      tier2: tier2Earnings,
      count: earnings.length,
    })

    return NextResponse.json({
      earnings: formattedEarnings,
      summary: {
        totalEarnings,
        tier1Earnings,
        tier2Earnings,
        totalTransactions: earnings.length,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching earnings:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}
