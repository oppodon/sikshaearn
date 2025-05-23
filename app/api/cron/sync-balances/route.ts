import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: Request) {
  try {
    // Check for secret token to prevent unauthorized access
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    console.log("Connected to MongoDB for syncing balances via cron")

    // Get all users
    const users = await User.find().select("_id")
    console.log(`Found ${users.length} users to sync balances for`)

    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      const userId = user._id

      try {
        // Get all approved transactions with this user as affiliate
        const transactions = await Transaction.find({
          status: "approved",
          affiliateId: userId,
        }).populate("package")

        // Calculate totals
        let totalEarnings = 0
        let pendingBalance = 0
        let availableBalance = 0

        for (const transaction of transactions) {
          if (!transaction.package || !transaction.package.price) continue

          const packageAmount = transaction.package.price
          const commission = Math.round(packageAmount * 0.65) // 65% commission

          totalEarnings += commission

          // If transaction is older than 14 days, add to available, otherwise to pending
          const transactionDate = transaction.approvedAt || transaction.createdAt
          const fourteenDaysAgo = new Date()
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

          if (transactionDate < fourteenDaysAgo) {
            availableBalance += commission
          } else {
            pendingBalance += commission
          }
        }

        // Get second-tier earnings (5% from transactions where user was referred by this user)
        const directAffiliates = await User.find({ referredBy: userId }).select("_id")
        const directAffiliateIds = directAffiliates.map((aff) => aff._id)

        const tier2Transactions = await Transaction.find({
          status: "approved",
          affiliateId: { $in: directAffiliateIds },
        }).populate("package")

        for (const transaction of tier2Transactions) {
          if (!transaction.package || !transaction.package.price) continue

          const packageAmount = transaction.package.price
          const tier2Commission = Math.round(packageAmount * 0.05) // 5% commission

          totalEarnings += tier2Commission

          // If transaction is older than 14 days, add to available, otherwise to pending
          const transactionDate = transaction.approvedAt || transaction.createdAt
          const fourteenDaysAgo = new Date()
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

          if (transactionDate < fourteenDaysAgo) {
            availableBalance += tier2Commission
          } else {
            pendingBalance += tier2Commission
          }
        }

        // Get withdrawals
        const withdrawals = await BalanceTransaction.find({
          user: userId,
          type: "debit",
          category: "withdrawal",
        })

        const withdrawnBalance = withdrawals.reduce((total, w) => total + w.amount, 0)

        // Update or create balance record
        await Balance.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              available: availableBalance,
              pending: pendingBalance,
              withdrawn: withdrawnBalance,
              lastSyncedAt: new Date(),
            },
          },
          { new: true, upsert: true },
        )

        successCount++
      } catch (error) {
        console.error(`Error syncing balance for user ${userId}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      message: "Balances synced successfully via cron job",
      stats: {
        total: users.length,
        success: successCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    console.error("Error syncing balances via cron:", error)
    return NextResponse.json({ error: "Failed to sync balances" }, { status: 500 })
  }
}
