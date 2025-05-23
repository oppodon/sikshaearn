import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User"
import Transaction from "../models/Transaction"
import Balance from "../models/Balance"
import BalanceTransaction from "../models/BalanceTransaction"

dotenv.config()

async function updateUserBalances() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "")
    console.log("Connected to MongoDB")

    // Get all approved transactions with affiliate IDs
    const transactions = await Transaction.find({
      status: "approved",
      affiliateId: { $exists: true, $ne: null },
    }).populate("package user")

    console.log(`Found ${transactions.length} transactions with affiliates`)

    // Process each transaction
    for (const transaction of transactions) {
      try {
        if (!transaction.package || !transaction.package.price) {
          console.log(`Skipping transaction ${transaction._id} - no package or price`)
          continue
        }

        const packageAmount = transaction.package.price
        const affiliateId = transaction.affiliateId

        // Process direct commission (65%)
        if (affiliateId) {
          const directCommission = Math.round(packageAmount * 0.65)

          // Get or create balance
          let balance = await Balance.findOne({ user: affiliateId })
          if (!balance) {
            balance = new Balance({
              user: affiliateId,
              totalEarnings: 0,
              availableBalance: 0,
              pendingBalance: 0,
              withdrawnBalance: 0,
              processingBalance: 0,
              lastUpdated: new Date(),
            })
          }

          // Check if transaction is already processed
          const existingTransaction = await BalanceTransaction.findOne({
            referenceId: transaction._id,
            user: affiliateId,
          })

          if (!existingTransaction) {
            // Update balance
            balance.totalEarnings += directCommission

            // If transaction is older than 14 days, add to available, otherwise to pending
            const transactionDate = transaction.approvedAt || transaction.createdAt
            const fourteenDaysAgo = new Date()
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

            if (transactionDate < fourteenDaysAgo) {
              balance.availableBalance += directCommission
            } else {
              balance.pendingBalance += directCommission
            }

            await balance.save()

            // Create balance transaction record
            await BalanceTransaction.create({
              user: affiliateId,
              type: "credit",
              category: "commission",
              amount: directCommission,
              description: `Direct referral commission from ${transaction.package.title || "package purchase"}`,
              referenceId: transaction._id,
              referenceType: "Transaction",
              tier: 1,
              status: transactionDate < fourteenDaysAgo ? "completed" : "pending",
              balanceBefore: balance.availableBalance - (transactionDate < fourteenDaysAgo ? directCommission : 0),
              balanceAfter: balance.availableBalance,
              metadata: {
                packageId: transaction.package._id,
                packageTitle: transaction.package.title,
                customerName: transaction.user?.name,
                customerEmail: transaction.user?.email,
                commissionRate: 65,
              },
            })

            // Update user's referral earnings
            await User.findByIdAndUpdate(affiliateId, {
              $inc: {
                referralEarnings: directCommission,
                totalEarnings: directCommission,
              },
            })

            console.log(`Added direct commission of ${directCommission} to user ${affiliateId}`)
          } else {
            console.log(`Transaction ${transaction._id} already processed for user ${affiliateId}`)
          }

          // Process second-tier commission (5%)
          const referrer = await User.findById(affiliateId)
          if (referrer && referrer.referredBy) {
            const secondTierCommission = Math.round(packageAmount * 0.05)

            // Get or create balance for second-tier affiliate
            let tier2Balance = await Balance.findOne({ user: referrer.referredBy })
            if (!tier2Balance) {
              tier2Balance = new Balance({
                user: referrer.referredBy,
                totalEarnings: 0,
                availableBalance: 0,
                pendingBalance: 0,
                withdrawnBalance: 0,
                processingBalance: 0,
                lastUpdated: new Date(),
              })
            }

            // Check if transaction is already processed for second-tier
            const existingTier2Transaction = await BalanceTransaction.findOne({
              referenceId: transaction._id,
              user: referrer.referredBy,
            })

            if (!existingTier2Transaction) {
              // Update balance
              tier2Balance.totalEarnings += secondTierCommission

              // If transaction is older than 14 days, add to available, otherwise to pending
              const transactionDate = transaction.approvedAt || transaction.createdAt
              const fourteenDaysAgo = new Date()
              fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

              if (transactionDate < fourteenDaysAgo) {
                tier2Balance.availableBalance += secondTierCommission
              } else {
                tier2Balance.pendingBalance += secondTierCommission
              }

              await tier2Balance.save()

              // Create balance transaction record
              await BalanceTransaction.create({
                user: referrer.referredBy,
                type: "credit",
                category: "commission",
                amount: secondTierCommission,
                description: `Second-tier referral commission from ${transaction.package.title || "package purchase"}`,
                referenceId: transaction._id,
                referenceType: "Transaction",
                tier: 2,
                status: transactionDate < fourteenDaysAgo ? "completed" : "pending",
                balanceBefore:
                  tier2Balance.availableBalance - (transactionDate < fourteenDaysAgo ? secondTierCommission : 0),
                balanceAfter: tier2Balance.availableBalance,
                metadata: {
                  packageId: transaction.package._id,
                  packageTitle: transaction.package.title,
                  customerName: transaction.user?.name,
                  customerEmail: transaction.user?.email,
                  commissionRate: 5,
                },
              })

              // Update user's tier2 earnings
              await User.findByIdAndUpdate(referrer.referredBy, {
                $inc: {
                  tier2Earnings: secondTierCommission,
                  totalEarnings: secondTierCommission,
                },
              })

              console.log(`Added second-tier commission of ${secondTierCommission} to user ${referrer.referredBy}`)
            } else {
              console.log(
                `Transaction ${transaction._id} already processed for second-tier user ${referrer.referredBy}`,
              )
            }
          }
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction._id}:`, error)
      }
    }

    console.log("Finished updating user balances")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the script
updateUserBalances()
