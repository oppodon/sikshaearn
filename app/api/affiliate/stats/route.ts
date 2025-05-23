import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import { BalanceService } from "@/lib/balance-service"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get user data including referral code
    const user = await User.findById(session.user.id).lean()

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate referral code if not exists
    let referralCode = user.referralCode
    if (!referralCode) {
      referralCode = user._id.toString().substring(0, 6).toUpperCase()
      await User.findByIdAndUpdate(session.user.id, { referralCode })
    }

    // Get affiliate stats
    const directReferrals = await User.countDocuments({ referredBy: session.user.id })
    const secondTierReferrals = await User.countDocuments({
      referredBy: { $in: await User.find({ referredBy: session.user.id }).distinct("_id") },
    })

    // Get balance data
    const balanceData = await BalanceService.getBalanceSummary(session.user.id)
    const balance = balanceData.balance || {
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      withdrawnBalance: 0,
      processingBalance: 0,
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      affiliateId: session.user.id,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("package", "title price")
      .lean()

    // Calculate conversion rate
    const totalClicks = user.referralClicks || 0
    const conversionRate = totalClicks > 0 ? ((directReferrals / totalClicks) * 100).toFixed(2) : "0"

    // Get referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://knowledgehubnepal.com"
    const referralLink = `${baseUrl}/?ref=${referralCode}`

    return NextResponse.json({
      stats: {
        directReferrals,
        secondTierReferrals,
        totalReferrals: directReferrals + secondTierReferrals,
        earnings: {
          total: user.totalEarnings || balance.totalEarnings || 0,
          available: balance.availableBalance || 0,
          pending: balance.pendingBalance || 0,
          withdrawn: balance.withdrawnBalance || 0,
          processing: balance.processingBalance || 0,
          tier1: user.referralEarnings || 0,
          tier2: user.tier2Earnings || 0,
        },
        conversionRate,
        referralCode,
        referralLink,
        referralClicks: totalClicks,
      },
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx._id,
        date: tx.createdAt,
        package: tx.package?.title || "Unknown Package",
        amount: tx.package?.price || 0,
        commission: Math.round((tx.package?.price || 0) * 0.65), // 65% commission
        customer: tx.user?.email ? tx.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "unknown@email.com",
      })),
    })
  } catch (error) {
    console.error("Error fetching affiliate stats:", error)
    return NextResponse.json({ message: "Failed to fetch affiliate stats" }, { status: 500 })
  }
}
