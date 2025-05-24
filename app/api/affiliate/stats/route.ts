import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, User, Balance, BalanceTransaction } from "@/lib/models"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const userId = session.user.id
    console.log("📊 Fetching affiliate stats for user:", userId)

    // Get user data
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get balance directly from Balance collection
    let balance = await Balance.findOne({ user: userId })

    if (!balance) {
      balance = {
        available: 0,
        pending: 0,
        processing: 0,
        withdrawn: 0,
      }
    }

    console.log("💰 User balance:", {
      available: balance.available,
      pending: balance.pending,
      processing: balance.processing,
      withdrawn: balance.withdrawn,
    })

    // Get referral counts
    const directReferrals = await User.countDocuments({ referredBy: userId })
    const tier2Referrals = await User.countDocuments({
      referredBy: { $in: await User.find({ referredBy: userId }).distinct("_id") },
    })

    console.log(`👥 Referrals - Direct: ${directReferrals}, Tier 2: ${tier2Referrals}`)

    // Get total earnings from BalanceTransaction
    const allCommissions = await BalanceTransaction.find({
      user: userId,
      type: "credit",
      status: "completed",
    }).lean()

    const totalEarnings = allCommissions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    const directEarnings = allCommissions
      .filter((tx) => tx.metadata?.tier === 1 || !tx.metadata?.tier)
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    const tier2Earnings = allCommissions
      .filter((tx) => tx.metadata?.tier === 2)
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

    // Calculate conversion rate
    const linkClicks = user.linkClicks || 0
    const conversionRate = linkClicks > 0 ? Math.round((directReferrals / linkClicks) * 100) : 0

    const stats = {
      totalEarnings,
      directEarnings,
      tier2Earnings,
      availableBalance: Number(balance.available) || 0,
      pendingBalance: Number(balance.pending) || 0,
      processingBalance: Number(balance.processing) || 0,
      withdrawnBalance: Number(balance.withdrawn) || 0,
      totalReferrals: directReferrals + tier2Referrals,
      directReferrals,
      tier2Referrals,
      conversionRate,
      linkClicks,
    }

    console.log("📤 Returning affiliate stats:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching affiliate stats:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate stats" }, { status: 500 })
  }
}
