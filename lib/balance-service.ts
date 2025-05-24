import mongoose from "mongoose"
import { ensureModelsRegistered, Balance, BalanceTransaction } from "@/lib/models"

export class BalanceService {
  /**
   * Get or create balance for a user
   */
  static async getOrCreateBalance(userId: string | mongoose.Types.ObjectId) {
    try {
      ensureModelsRegistered()

      let balance = await Balance.findOne({ user: userId })

      if (!balance) {
        balance = await Balance.create({
          user: userId,
          available: 0,
          pending: 0,
          processing: 0,
          withdrawn: 0,
          lastSyncedAt: new Date(),
        })

        console.log("✅ Created new balance for user:", userId)
      }

      return balance
    } catch (error) {
      console.error("❌ Error getting or creating balance:", error)
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
    let session: mongoose.ClientSession | null = null

    try {
      ensureModelsRegistered()

      console.log(`💰 Starting commission addition: ₹${amount} to user ${userId} (Tier ${tier})`)

      // Start session for transaction
      session = await mongoose.startSession()
      await session.startTransaction()

      // Get or create balance
      let balance = await Balance.findOne({ user: userId }).session(session)

      if (!balance) {
        balance = await Balance.create(
          [
            {
              user: userId,
              available: 0,
              pending: 0,
              processing: 0,
              withdrawn: 0,
              lastSyncedAt: new Date(),
            },
          ],
          { session },
        )
        balance = balance[0]
        console.log("✅ Created new balance for user:", userId)
      }

      // Ensure we have valid numbers
      const currentAvailable = Number(balance.available) || 0
      console.log(`📊 Balance before: ₹${currentAvailable}`)

      // Update balance fields - ADD to existing balance
      balance.available = currentAvailable + amount
      balance.lastSyncedAt = new Date()

      // Save the updated balance
      await balance.save({ session })

      console.log(`📊 Balance after: ₹${balance.available}`)

      // Create balance transaction record
      const balanceTransaction = await BalanceTransaction.create(
        [
          {
            user: userId,
            type: "credit",
            amount,
            description: `${tier === 1 ? "Direct" : "Second-tier"} referral commission from ${packageTitle || "package purchase"}`,
            status: "completed",
            metadata: {
              packageId,
              packageTitle,
              customerName,
              customerEmail,
              commissionRate,
              tier,
              transactionId,
            },
          },
        ],
        { session },
      )

      console.log(`📝 Balance transaction created: ${balanceTransaction[0]._id}`)

      await session.commitTransaction()

      console.log(`✅ Commission added successfully: ₹${amount} to user ${userId} (Tier ${tier})`)

      return {
        balance,
        transaction: balanceTransaction[0],
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction()
      }
      console.error("❌ Error adding commission:", error)
      throw error
    } finally {
      if (session) {
        await session.endSession()
      }
    }
  }

  /**
   * Get balance summary for a user
   */
  static async getBalanceSummary(userId: string | mongoose.Types.ObjectId) {
    try {
      ensureModelsRegistered()

      console.log(`📊 Getting balance summary for user: ${userId}`)

      // Get or create balance
      const balance = await this.getOrCreateBalance(userId)

      // Get recent transactions
      const recentTransactions = await BalanceTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

      console.log(`📊 Balance summary for user ${userId}:`, {
        available: balance.available,
        pending: balance.pending,
        processing: balance.processing,
        withdrawn: balance.withdrawn,
        transactionsCount: recentTransactions.length,
      })

      return {
        balance,
        recentTransactions,
      }
    } catch (error) {
      console.error("❌ Error getting balance summary:", error)
      throw error
    }
  }

  /**
   * Sync balance from transactions (repair function)
   */
  static async syncUserBalance(userId: string | mongoose.Types.ObjectId) {
    try {
      ensureModelsRegistered()

      console.log(`🔄 Syncing balance for user: ${userId}`)

      // Get all completed balance transactions for this user
      const transactions = await BalanceTransaction.find({
        user: userId,
        status: "completed",
        type: "credit",
      })

      console.log(`📊 Found ${transactions.length} completed commission transactions`)

      // Calculate totals
      let totalAvailable = 0

      for (const transaction of transactions) {
        const amount = Number(transaction.amount) || 0
        totalAvailable += amount
        console.log(`💰 Adding ₹${amount} from transaction ${transaction._id}`)
      }

      console.log(`💰 Calculated total available: ₹${totalAvailable}`)

      // Update or create balance
      const balance = await Balance.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            available: totalAvailable,
            pending: 0,
            processing: 0,
            withdrawn: 0,
            lastSyncedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        },
      )

      console.log(`✅ Balance synced for user ${userId}: ₹${balance.available}`)

      return balance
    } catch (error) {
      console.error("❌ Error syncing balance:", error)
      throw error
    }
  }
}
