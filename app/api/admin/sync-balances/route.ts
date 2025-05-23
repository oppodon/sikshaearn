import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"

export async function POST(req: Request) {
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
    console.log("Connected to MongoDB for syncing balances")

    // Get request body
    const body = await req.json()
    const { userId } = body

    // If userId is provided, only sync that user's balance
    const userFilter = userId ? { _id: userId } : {}
    console.log("Using user filter:", userFilter)

    // Get all users with affiliate earnings
    const users = await User.find(userFilter).select("_id")
    console.log(`Found ${users.length} users to sync balances for`)

    const results = await Promise.all(
      users.map(async (user) => {
        const userId = user._id

        try {
          // Get all approved transactions with this user as affiliate
          const transactions = await Transaction.find({
            status: "approved",
            affiliateId: userId,
          }).populate("package")

          console.log(`User ${userId} has ${transactions.length} approved transactions as affiliate`)

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

          console.log(`User ${userId} has ${tier2Transactions.length} tier-2 transactions`)

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

          console.log(`User ${userId} calculated totals:`, {
            totalEarnings,
            pendingBalance,
            availableBalance,
            withdrawnBalance,
          })

          // Update or create balance record
          const balance = await Balance.findOneAndUpdate(
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

          console.log(`Updated balance for user ${userId}:`, balance)

          // Create balance transaction record for the sync
          await BalanceTransaction.create({
            user: userId,
            amount: 0, // No actual balance change, just a sync
            type: "sync",
            description: "Balance synced with transactions",
            status: "completed",
            metadata: {
              previousBalance: balance.toObject(),
              operation: "admin-sync",
            },
          })

          console.log(`Created balance transaction record for user ${userId}`)

          return {
            userId: userId.toString(),
            success: true,
            balance: {
              pending: pendingBalance,
              available: availableBalance,
              withdrawn: withdrawnBalance,
              total: totalEarnings,
            },
          }
        } catch (error) {
          console.error(`Error syncing balance for user ${userId}:`, error)
          return { userId: userId.toString(), success: false, error: String(error) }
        }
      }),
    )

    console.log("Sync results:", results)
    return NextResponse.json({
      message: "Balances synced successfully",
      results,
    })
  } catch (error) {
    console.error("Error syncing balances:", error)
    return NextResponse.json({ message: "Failed to sync balances", error: String(error) }, { status: 500 })
  }
}
