import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"
import AffiliateEarning from "@/models/AffiliateEarning"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await dbConnect()

    // Get all balances with populated user data
    const balances = await Balance.find({})
      .populate({
        path: "user",
        select: "name email image referralCode referredBy",
        populate: {
          path: "referredBy",
          select: "name email referralCode",
        },
      })
      .lean()

    // Filter out balances without valid user data
    const validBalances = balances.filter((balance) => balance.user && balance.user._id)

    // Get recent transactions for all users
    const balanceTransactions = await BalanceTransaction.find({})
      .populate("user", "name email image")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    // Get affiliate earnings to calculate total referrals and earnings
    const affiliateEarnings = await AffiliateEarning.find({})
      .populate("affiliate", "name email referralCode")
      .populate("referredUser", "name email")
      .lean()

    // Process data to create comprehensive balance overview
    const balanceData = await Promise.all(
      validBalances.map(async (balance) => {
        try {
          // Safely access user data
          const user = balance.user
          if (!user || !user._id) {
            console.warn(`Balance ${balance._id} has no valid user data`)
            return null
          }

          // Get referral information - it might already be populated
          let referredBy = null
          if (user.referredBy) {
            if (typeof user.referredBy === "object" && user.referredBy._id) {
              // Already populated
              referredBy = {
                _id: user.referredBy._id,
                name: user.referredBy.name,
                email: user.referredBy.email,
                referralCode: user.referredBy.referralCode,
              }
            } else {
              // Need to populate manually
              try {
                const referredByUser = await User.findById(user.referredBy).select("name email referralCode").lean()
                if (referredByUser) {
                  referredBy = referredByUser
                }
              } catch (error) {
                console.warn(`Failed to fetch referredBy user for ${user._id}:`, error)
              }
            }
          }

          // Count total referrals for this user
          const totalReferrals = await User.countDocuments({ referredBy: user._id })

          // Calculate total earnings from affiliate earnings
          const userEarnings = affiliateEarnings.filter(
            (earning) =>
              earning.affiliate && earning.affiliate._id && earning.affiliate._id.toString() === user._id.toString(),
          )
          const totalEarningsFromAffiliates = userEarnings.reduce((sum, earning) => sum + (earning.amount || 0), 0)

          // Calculate total earnings (available + pending + withdrawn + affiliate earnings)
          const totalEarnings =
            (balance.available || 0) + (balance.pending || 0) + (balance.withdrawn || 0) + totalEarningsFromAffiliates

          // Get recent transactions for this user
          const recentTransactions = balanceTransactions
            .filter((tx) => tx.user && tx.user._id && tx.user._id.toString() === user._id.toString())
            .slice(0, 10)
            .map((tx) => ({
              _id: tx._id,
              amount: tx.amount || 0,
              type: tx.type || "unknown",
              description: tx.description || "No description",
              createdAt: tx.createdAt,
              status: tx.status || "completed",
            }))

          return {
            _id: balance._id,
            user: {
              _id: user._id,
              name: user.name || "Unknown User",
              email: user.email || "No email",
              image: user.image,
              referralCode: user.referralCode,
            },
            available: balance.available || 0,
            pending: balance.pending || 0,
            processing: balance.processing || 0,
            withdrawn: balance.withdrawn || 0,
            lastSyncedAt: balance.lastSyncedAt || balance.updatedAt,
            createdAt: balance.createdAt,
            updatedAt: balance.updatedAt,
            referredBy,
            totalReferrals,
            totalEarnings,
            recentTransactions,
          }
        } catch (error) {
          console.error(`Error processing balance ${balance._id}:`, error)
          return null
        }
      }),
    )

    // Filter out null results
    const validBalanceData = balanceData.filter(Boolean)

    // Get total user count
    const totalUsers = await User.countDocuments({})

    // Calculate overall statistics
    const stats = {
      totalUsers,
      totalAvailableBalance: validBalanceData.reduce((sum, b) => sum + (b?.available || 0), 0),
      totalPendingBalance: validBalanceData.reduce((sum, b) => sum + (b?.pending || 0), 0),
      totalWithdrawnBalance: validBalanceData.reduce((sum, b) => sum + (b?.withdrawn || 0), 0),
      totalEarnings: validBalanceData.reduce((sum, b) => sum + (b?.totalEarnings || 0), 0),
      activeAffiliates: validBalanceData.filter((b) => b && b.totalReferrals > 0).length,
    }

    return NextResponse.json({
      balances: validBalanceData,
      stats,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching balance overview:", error)
    return NextResponse.json(
      {
        message: "Failed to fetch balance overview",
        error: String(error),
        balances: [],
        stats: {
          totalUsers: 0,
          totalAvailableBalance: 0,
          totalPendingBalance: 0,
          totalWithdrawnBalance: 0,
          totalEarnings: 0,
          activeAffiliates: 0,
        },
      },
      { status: 500 },
    )
  }
}
