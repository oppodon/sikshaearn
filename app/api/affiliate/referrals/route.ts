import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, User, Transaction, BalanceTransaction } from "@/lib/models"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const userId = session.user.id
    console.log("🔍 Fetching referrals for user:", userId)

    // Get direct referrals
    const directReferrals = await User.find({ referredBy: userId }).select("name email createdAt").lean()
    console.log("👥 Found direct referrals:", directReferrals.length)

    // Get second-tier referrals
    const directReferralIds = directReferrals.map((ref) => ref._id.toString())
    const tier2Referrals = await User.find({
      referredBy: { $in: directReferralIds },
    })
      .select("name email createdAt referredBy")
      .populate("referredBy", "name email")
      .lean()

    console.log("👥 Found tier 2 referrals:", tier2Referrals.length)

    // Get transaction data for each direct referral
    const directAffiliatesWithData = await Promise.all(
      directReferrals.map(async (referral) => {
        const referralId = referral._id.toString()

        // Get all transactions for this referral (any status)
        const allTransactions = await Transaction.find({
          user: referralId,
        }).lean()

        // Get approved/completed transactions
        const approvedTransactions = allTransactions.filter(
          (tx) => tx.status === "approved" || tx.status === "completed",
        )

        console.log(`💰 User ${referral.name} (${referralId}):`)
        console.log(`  - Total transactions: ${allTransactions.length}`)
        console.log(`  - Approved transactions: ${approvedTransactions.length}`)

        // Get commission earned from this specific referral
        const commissionTransactions = await BalanceTransaction.find({
          user: userId,
          type: "credit",
          status: "completed",
          $or: [
            { "metadata.customerEmail": referral.email },
            { "metadata.customerId": referralId },
            { "metadata.transactionId": { $in: allTransactions.map((tx) => tx._id.toString()) } },
          ],
        }).lean()

        console.log(`💸 Found ${commissionTransactions.length} commission transactions for ${referral.name}`)

        const totalSpent = approvedTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
        const totalCommission = commissionTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

        console.log(`📊 ${referral.name}: Spent ₹${totalSpent}, Commission ₹${totalCommission}`)

        return {
          ...referral,
          _id: referralId,
          purchases: approvedTransactions.length,
          totalSpent,
          commission: totalCommission,
        }
      }),
    )

    // Get transaction data for tier 2 referrals
    const tier2AffiliatesWithData = await Promise.all(
      tier2Referrals.map(async (referral) => {
        const referralId = referral._id.toString()

        const allTransactions = await Transaction.find({
          user: referralId,
        }).lean()

        const approvedTransactions = allTransactions.filter(
          (tx) => tx.status === "approved" || tx.status === "completed",
        )

        // Get tier 2 commission earned from this referral
        const commissionTransactions = await BalanceTransaction.find({
          user: userId,
          type: "credit",
          status: "completed",
          "metadata.tier": 2,
          $or: [
            { "metadata.customerEmail": referral.email },
            { "metadata.customerId": referralId },
            { "metadata.transactionId": { $in: allTransactions.map((tx) => tx._id.toString()) } },
          ],
        }).lean()

        const totalSpent = approvedTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
        const totalCommission = commissionTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

        return {
          ...referral,
          _id: referralId,
          referredBy: referral.referredBy?.name || "Unknown",
          purchases: approvedTransactions.length,
          totalSpent,
          commission: totalCommission,
        }
      }),
    )

    // Calculate total earnings from BalanceTransaction
    const allCommissions = await BalanceTransaction.find({
      user: userId,
      type: "credit",
      status: "completed",
    }).lean()

    const tier1Commissions = allCommissions.filter((tx) => tx.metadata?.tier === 1 || !tx.metadata?.tier)
    const tier2Commissions = allCommissions.filter((tx) => tx.metadata?.tier === 2)

    const directEarnings = tier1Commissions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    const tier2Earnings = tier2Commissions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    const totalEarnings = directEarnings + tier2Earnings

    console.log("📈 Total earnings:", { directEarnings, tier2Earnings, totalEarnings })

    // Get user's referral clicks for conversion rate
    const user = await User.findById(userId).select("referralClicks").lean()
    const totalClicks = user?.referralClicks || 0
    const conversionRate = totalClicks > 0 ? ((directReferrals.length / totalClicks) * 100).toFixed(2) : "0"

    const stats = {
      directReferrals: directReferrals.length,
      tier2Referrals: tier2Referrals.length,
      totalEarnings,
      directEarnings,
      tier2Earnings,
      conversionRate: Number.parseFloat(conversionRate),
    }

    console.log("📊 Final stats:", stats)

    return NextResponse.json({
      stats,
      directAffiliates: directAffiliatesWithData,
      tier2Affiliates: tier2AffiliatesWithData,
    })
  } catch (error) {
    console.error("❌ Error fetching affiliate referrals:", error)
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
