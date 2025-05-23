import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import AffiliateEarning from "@/models/AffiliateEarning"
import Balance from "@/models/Balance"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    console.log("Connected to MongoDB for affiliate stats")

    // Get user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log(`Fetching stats for user: ${user._id}`)

    // Get balance
    const balance = await Balance.findOne({ user: user._id })
    console.log("User balance:", balance)

    // Get direct referrals
    const directReferrals = await User.countDocuments({ referredBy: user._id })
    console.log("Direct referrals:", directReferrals)

    // Get tier 2 referrals (users referred by your referrals)
    const directReferralUsers = await User.find({ referredBy: user._id }).select("_id")
    const directReferralIds = directReferralUsers.map((ref) => ref._id)
    const tier2Referrals = await User.countDocuments({ referredBy: { $in: directReferralIds } })
    console.log("Tier 2 referrals:", tier2Referrals)

    // Get earnings
    const earnings = await AffiliateEarning.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
          directEarnings: {
            $sum: {
              $cond: [{ $eq: ["$tier", 1] }, "$amount", 0],
            },
          },
          tier2Earnings: {
            $sum: {
              $cond: [{ $eq: ["$tier", 2] }, "$amount", 0],
            },
          },
        },
      },
    ])
    console.log("Earnings aggregation:", earnings)

    // Calculate conversion rate
    const linkClicks = user.referralClicks || 0
    const conversionRate = linkClicks > 0 ? Math.round((directReferrals / linkClicks) * 100) : 0
    console.log(`Link clicks: ${linkClicks}, Conversion rate: ${conversionRate}%`)

    // Prepare response
    const stats = {
      totalEarnings: earnings.length > 0 ? earnings[0].totalEarnings : 0,
      directEarnings: earnings.length > 0 ? earnings[0].directEarnings : 0,
      tier2Earnings: earnings.length > 0 ? earnings[0].tier2Earnings : 0,
      availableBalance: balance?.available || 0,
      pendingBalance: balance?.pending || 0,
      processingBalance: balance?.processing || 0,
      withdrawnBalance: balance?.withdrawn || 0,
      totalReferrals: directReferrals + tier2Referrals,
      directReferrals,
      tier2Referrals,
      conversionRate,
      linkClicks,
    }

    console.log("Returning stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching affiliate stats:", error)
    return NextResponse.json({ message: "Failed to fetch affiliate stats", error: String(error) }, { status: 500 })
  }
}
