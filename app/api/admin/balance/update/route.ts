import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import User from "@/models/User"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"
import Transaction from "@/models/Transaction"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get all transactions with referrals
    const transactions = await Transaction.find({
      status: "approved",
      referrerId: { $exists: true, $ne: null },
    }).lean()

    console.log(`Found ${transactions.length} transactions with referrals`)

    let updatedCount = 0
    let errorCount = 0

    // Process each transaction
    for (const transaction of transactions) {
      try {
        const { referrerId, amount } = transaction

        if (!referrerId) continue

        // Calculate commissions
        const directCommission = amount * 0.65 // 65% for direct referrer

        // Get referrer
        const referrer = await User.findById(referrerId)
        if (!referrer) continue

        // Get or create balance for referrer
        let referrerBalance = await Balance.findOne({ userId: referrerId })
        if (!referrerBalance) {
          referrerBalance = new Balance({
            userId: referrerId,
            totalEarnings: 0,
            availableBalance: 0,
            pendingBalance: 0,
            withdrawnBalance: 0,
            processingBalance: 0,
          })
        }

        // Check if we already processed this transaction
        const existingTransaction = await BalanceTransaction.findOne({
          userId: referrerId,
          relatedTransactionId: transaction._id,
        })

        if (existingTransaction) {
          console.log(`Transaction ${transaction._id} already processed for user ${referrerId}`)
          continue
        }

        // Update referrer balance
        referrerBalance.totalEarnings += directCommission
        referrerBalance.availableBalance += directCommission
        await referrerBalance.save()

        // Create balance transaction record
        await BalanceTransaction.create({
          userId: referrerId,
          amount: directCommission,
          type: "credit",
          status: "completed",
          description: "Commission from referral purchase",
          relatedTransactionId: transaction._id,
          metadata: {
            transactionId: transaction._id,
            packageId: transaction.packageId,
            packageName: transaction.packageName,
            commissionType: "direct",
            commissionRate: "65%",
          },
        })

        // Update user referral earnings
        await User.findByIdAndUpdate(referrerId, {
          $inc: {
            referralEarnings: directCommission,
            totalEarnings: directCommission,
          },
        })

        // Process second-tier commission if applicable
        if (referrer.referredBy) {
          const tier2Commission = amount * 0.05 // 5% for second-tier referrer

          // Get or create balance for second-tier referrer
          let tier2Balance = await Balance.findOne({ userId: referrer.referredBy })
          if (!tier2Balance) {
            tier2Balance = new Balance({
              userId: referrer.referredBy,
              totalEarnings: 0,
              availableBalance: 0,
              pendingBalance: 0,
              withdrawnBalance: 0,
              processingBalance: 0,
            })
          }

          // Check if we already processed this transaction for tier2
          const existingTier2Transaction = await BalanceTransaction.findOne({
            userId: referrer.referredBy,
            relatedTransactionId: transaction._id,
          })

          if (existingTier2Transaction) {
            console.log(`Transaction ${transaction._id} already processed for tier2 user ${referrer.referredBy}`)
            continue
          }

          // Update tier2 referrer balance
          tier2Balance.totalEarnings += tier2Commission
          tier2Balance.availableBalance += tier2Commission
          await tier2Balance.save()

          // Create balance transaction record for tier2
          await BalanceTransaction.create({
            userId: referrer.referredBy,
            amount: tier2Commission,
            type: "credit",
            status: "completed",
            description: "Commission from second-tier referral purchase",
            relatedTransactionId: transaction._id,
            metadata: {
              transactionId: transaction._id,
              packageId: transaction.packageId,
              packageName: transaction.packageName,
              commissionType: "tier2",
              commissionRate: "5%",
            },
          })

          // Update user tier2 earnings
          await User.findByIdAndUpdate(referrer.referredBy, {
            $inc: {
              tier2Earnings: tier2Commission,
              totalEarnings: tier2Commission,
            },
          })
        }

        updatedCount++
      } catch (error) {
        console.error(`Error processing transaction ${transaction._id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${updatedCount} transactions successfully. Errors: ${errorCount}`,
      updatedCount,
      errorCount,
    })
  } catch (error: any) {
    console.error("Error updating balances:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
