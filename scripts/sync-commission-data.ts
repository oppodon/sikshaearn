import { connectToDatabase } from "../lib/mongodb"
import { ensureModelsRegistered, BalanceTransaction, Balance } from "../lib/models"

async function syncCommissionData() {
  try {
    console.log("🔄 Starting commission data sync...")

    await connectToDatabase()
    ensureModelsRegistered()

    // Find all balance transactions that are commission-related but missing category
    const commissionTransactions = await BalanceTransaction.find({
      type: "credit",
      description: { $regex: /commission|referral/i },
      $or: [{ category: { $exists: false } }, { category: null }, { category: "" }],
    })

    console.log(`📊 Found ${commissionTransactions.length} commission transactions to update`)

    // Update each transaction to add the commission category
    for (const transaction of commissionTransactions) {
      await BalanceTransaction.findByIdAndUpdate(transaction._id, {
        $set: { category: "commission" },
      })
      console.log(`✅ Updated transaction ${transaction._id} with commission category`)
    }

    // Get all users with balance transactions
    const userIds = await BalanceTransaction.distinct("user", {
      type: "credit",
      category: "commission",
      status: "completed",
    })

    console.log(`👥 Found ${userIds.length} users with commission earnings`)

    // Sync balance for each user
    for (const userId of userIds) {
      const userTransactions = await BalanceTransaction.find({
        user: userId,
        type: "credit",
        category: "commission",
        status: "completed",
      })

      const totalEarnings = userTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

      // Update or create balance
      await Balance.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            available: totalEarnings,
            lastSyncedAt: new Date(),
          },
        },
        { upsert: true },
      )

      console.log(`💰 Synced balance for user ${userId}: ₹${totalEarnings}`)
    }

    console.log("✅ Commission data sync completed successfully!")
  } catch (error) {
    console.error("❌ Error syncing commission data:", error)
  }
}

// Run the sync
syncCommissionData()
