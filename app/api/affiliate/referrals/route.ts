import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import AffiliateEarning from "@/models/AffiliateEarning"
import Transaction from "@/models/Transaction"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = session.user.id

    // Get direct referrals
    const directReferrals = await User.find({ referredBy: userId }).select("name email createdAt").lean()

    // Get second-tier referrals (referrals of direct referrals)
    const directReferralIds = directReferrals.map((ref) => ref._id)
    const tier2Referrals = await User.find({
      referredBy: { $in: directReferralIds },
    })
      .select("name email createdAt referredBy")
      .populate("referredBy", "name email")
      .lean()

    // Get earnings by tier
    const tier1Earnings = await AffiliateEarning.aggregate([
      { $match: { user: userId, tier: 1, status: { $in: ["available", "withdrawn"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const tier2Earnings = await AffiliateEarning.aggregate([
      { $match: { user: userId, tier: 2, status: { $in: ["available", "withdrawn"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const directEarnings = tier1Earnings.length > 0 ? tier1Earnings[0].total : 0
    const tier2EarningsTotal = tier2Earnings.length > 0 ? tier2Earnings[0].total : 0
    const totalEarnings = directEarnings + tier2EarningsTotal

    // Get user's referral clicks for conversion rate
    const user = await User.findById(userId).select("referralClicks").lean()
    const totalClicks = user?.referralClicks || 0
    const conversionRate = totalClicks > 0 ? ((directReferrals.length / totalClicks) * 100).toFixed(2) : "0"

    // Get transaction data for each referral
    const directAffiliatesWithData = await Promise.all(
      directReferrals.map(async (referral) => {
        const transactions = await Transaction.find({
          user: referral._id,
          status: "approved",
        }).lean()

        const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
        const commission = totalSpent * 0.65 // 65% commission

        return {
          ...referral,
          purchases: transactions.length,
          totalSpent,
          commission,
        }
      }),
    )

    const tier2AffiliatesWithData = await Promise.all(
      tier2Referrals.map(async (referral) => {
        const transactions = await Transaction.find({
          user: referral._id,
          status: "approved",
        }).lean()

        const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
        const commission = totalSpent * 0.05 // 5% commission

        return {
          ...referral,
          referredBy: referral.referredBy?.name || "Unknown",
          purchases: transactions.length,
          totalSpent,
          commission,
        }
      }),
    )

    const stats = {
      directReferrals: directReferrals.length,
      tier2Referrals: tier2Referrals.length,
      totalEarnings,
      directEarnings,
      tier2Earnings: tier2EarningsTotal,
      conversionRate: Number.parseFloat(conversionRate),
    }

    return NextResponse.json({
      stats,
      directAffiliates: directAffiliatesWithData,
      tier2Affiliates: tier2AffiliatesWithData,
    })
  } catch (error) {
    console.error("Error fetching affiliate referrals:", error)
    return NextResponse.json(
      {
        message: "Failed to fetch affiliate data",
        stats: {
          directReferrals: 0,
          tier2Referrals: 0,
          totalEarnings: 0,
          directEarnings: 0,
          tier2Earnings: 0,
          conversionRate: 0,
        },
        directAffiliates: [],
        tier2Affiliates: [],
      },
      { status: 500 },
    )
  }
}
