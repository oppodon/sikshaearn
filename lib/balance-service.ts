import mongoose from "mongoose"
import Balance from "@/models/Balance"
import BalanceTransaction from "@/models/BalanceTransaction"
import User from "@/models/User"

export class BalanceService {
  /**
   * Get or create balance for a user
   */
  static async getOrCreateBalance(userId: string | mongoose.Types.ObjectId) {
    try {
      let balance = await Balance.findOne({ user: userId })

      if (!balance) {
        balance = await Balance.create({
          user: userId,
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          withdrawnBalance: 0,
          processingBalance: 0,
          lastUpdated: new Date(),
        })

        // Update user with balance reference
        await User.findByIdAndUpdate(userId, { balance: balance._id })
      }

      return balance
    } catch (error) {
      console.error("Error getting or creating balance:", error)
      throw error
    }
  }

  /**
   * Add commission to user's balance
   */
  static async addCommission({
    userId,
    amount,
    tier,
    transactionId,
    packageId,
    packageTitle,
    customerName,
    customerEmail,
    commissionRate,
  }: {
    userId: string | mongoose.Types.ObjectId
    amount: number
    tier: number
    transactionId: string | mongoose.Types.ObjectId
    packageId?: string | mongoose.Types.ObjectId
    packageTitle?: string
    customerName?: string
    customerEmail?: string
    commissionRate?: number
  }) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Get or create balance
      const balance = await this.getOrCreateBalance(userId)
      const balanceBefore = balance.pendingBalance

      // Add to pending balance (will be available after 14 days)
      balance.pendingBalance += amount
      balance.totalEarnings += amount
      balance.lastUpdated = new Date()

      await balance.save({ session })

      // Create balance transaction record
      const balanceTransaction = await BalanceTransaction.create(
        [
          {
            user: userId,
            type: "credit",
            category: "commission",
            amount,
            description: `${tier === 1 ? "Direct" : "Second-tier"} referral commission from ${packageTitle || "package purchase"}`,
            referenceId: transactionId,
            referenceType: "Transaction",
            tier,
            status: "pending",
            balanceBefore,
            balanceAfter: balance.pendingBalance,
            metadata: {
              packageId,
              packageTitle,
              customerName,
              customerEmail,
              commissionRate,
            },
          },
        ],
        { session },
      )

      // Update user's referral earnings
      if (tier === 1) {
        await User.findByIdAndUpdate(
          userId,
          {
            $inc: {
              referralEarnings: amount,
              totalEarnings: amount,
            },
          },
          { session },
        )
      } else if (tier === 2) {
        await User.findByIdAndUpdate(
          userId,
          {
            $inc: {
              tier2Earnings: amount,
              totalEarnings: amount,
            },
          },
          { session },
        )
      }

      await session.commitTransaction()

      console.log(`Commission added: ${amount} to user ${userId} (Tier ${tier})`)

      return {
        balance,
        transaction: balanceTransaction[0],
      }
    } catch (error) {
      await session.abortTransaction()
      console.error("Error adding commission:", error)
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Move pending balance to available (after 14 days)
   */
  static async movePendingToAvailable(userId: string | mongoose.Types.ObjectId, amount: number) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const balance = await Balance.findOne({ user: userId }).session(session)

      if (!balance) {
        throw new Error("Balance not found")
      }

      if (balance.pendingBalance < amount) {
        throw new Error("Insufficient pending balance")
      }

      const balanceBefore = balance.availableBalance

      balance.pendingBalance -= amount
      balance.availableBalance += amount
      balance.lastUpdated = new Date()

      await balance.save({ session })

      // Create balance transaction record
      await BalanceTransaction.create(
        [
          {
            user: userId,
            type: "transfer",
            category: "commission",
            amount,
            description: "Commission moved from pending to available",
            status: "completed",
            balanceBefore,
            balanceAfter: balance.availableBalance,
          },
        ],
        { session },
      )

      await session.commitTransaction()

      return balance
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Process withdrawal
   */
  static async processWithdrawal({
    userId,
    amount,
    withdrawalId,
  }: {
    userId: string | mongoose.Types.ObjectId
    amount: number
    withdrawalId: string | mongoose.Types.ObjectId
  }) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const balance = await Balance.findOne({ user: userId }).session(session)

      if (!balance) {
        throw new Error("Balance not found")
      }

      if (balance.availableBalance < amount) {
        throw new Error("Insufficient available balance")
      }

      const balanceBefore = balance.availableBalance

      balance.availableBalance -= amount
      balance.processingBalance += amount
      balance.lastUpdated = new Date()

      await balance.save({ session })

      // Create balance transaction record
      await BalanceTransaction.create(
        [
          {
            user: userId,
            type: "debit",
            category: "withdrawal",
            amount,
            description: "Withdrawal request processed",
            referenceId: withdrawalId,
            referenceType: "Withdrawal",
            status: "pending",
            balanceBefore,
            balanceAfter: balance.availableBalance,
          },
        ],
        { session },
      )

      await session.commitTransaction()

      return balance
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Complete withdrawal
   */
  static async completeWithdrawal({
    userId,
    amount,
    withdrawalId,
  }: {
    userId: string | mongoose.Types.ObjectId
    amount: number
    withdrawalId: string | mongoose.Types.ObjectId
  }) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const balance = await Balance.findOne({ user: userId }).session(session)

      if (!balance) {
        throw new Error("Balance not found")
      }

      if (balance.processingBalance < amount) {
        throw new Error("Insufficient processing balance")
      }

      const balanceBefore = balance.processingBalance

      balance.processingBalance -= amount
      balance.withdrawnBalance += amount
      balance.lastUpdated = new Date()

      await balance.save({ session })

      // Update balance transaction status
      await BalanceTransaction.findOneAndUpdate(
        {
          user: userId,
          referenceId: withdrawalId,
          referenceType: "Withdrawal",
          type: "debit",
        },
        {
          status: "completed",
          description: "Withdrawal completed successfully",
        },
        { session },
      )

      await session.commitTransaction()

      return balance
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Get balance summary for a user
   */
  static async getBalanceSummary(userId: string | mongoose.Types.ObjectId) {
    try {
      const balance = await this.getOrCreateBalance(userId)

      // Get recent transactions
      const recentTransactions = await BalanceTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("metadata.packageId", "title")
        .lean()

      return {
        balance,
        recentTransactions,
      }
    } catch (error) {
      console.error("Error getting balance summary:", error)
      throw error
    }
  }

  /**
   * Run scheduled task to move pending balances to available
   * This should be run daily via a cron job
   */
  static async processPendingCommissions() {
    try {
      // Find transactions that are pending and older than 14 days
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      const pendingTransactions = await BalanceTransaction.find({
        status: "pending",
        category: "commission",
        createdAt: { $lt: fourteenDaysAgo },
      })

      console.log(`Found ${pendingTransactions.length} pending transactions to process`)

      for (const transaction of pendingTransactions) {
        try {
          // Move from pending to available
          await this.movePendingToAvailable(transaction.user, transaction.amount)

          // Update transaction status
          transaction.status = "completed"
          transaction.description += " (moved to available balance)"
          await transaction.save()

          console.log(`Processed transaction ${transaction._id} for user ${transaction.user}`)
        } catch (error) {
          console.error(`Error processing transaction ${transaction._id}:`, error)
        }
      }

      return { processed: pendingTransactions.length }
    } catch (error) {
      console.error("Error processing pending commissions:", error)
      throw error
    }
  }
}
