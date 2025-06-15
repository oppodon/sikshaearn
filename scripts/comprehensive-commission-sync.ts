import { connectToDatabase } from "../lib/mongodb"
import { ensureModelsRegistered, Transaction, BalanceTransaction, User } from "../lib/models"
import { BalanceService } from "../lib/balance-service"

async function comprehensiveCommissionSync() {
  try {
    console.log("🔄 Starting comprehensive commission sync...")

    await connectToDatabase()
    ensureModelsRegistered()

    // Find all approved transactions that should have commissions
    const approvedTransactions = await Transaction.find({
      status: "approved",
    }).populate("user package")

    console.log(`📊 Found ${approvedTransactions.length} approved transactions`)

    for (const transaction of approvedTransactions) {
      console.log(`\n💰 Processing transaction ${transaction._id}`)
      console.log(`   Amount: ₹${transaction.amount}`)
      console.log(`   User: ${transaction.user?.name || transaction.user?.email}`)

      if (!transaction.user?.referredBy) {
        console.log("   ⚠️  No referrer found, skipping...")
        continue
      }

      // Check if commission already exists for this transaction
      const existingCommission = await BalanceTransaction.findOne({
        "metadata.transactionId": transaction._id,
        type: "credit",
        category: "commission",
      })

      if (existingCommission) {
        console.log("   ✅ Commission already exists, skipping...")
        continue
      }

      console.log(`   👤 Referrer: ${transaction.user.referredBy}`)

      // Calculate Tier 1 commission (65%)
      const tier1Commission = Math.floor(transaction.amount * 0.65)

      try {
        await BalanceService.addCommission({
          userId: transaction.user.referredBy,
          amount: tier1Commission,
          tier: 1,
          transactionId: transaction._id,
          packageId: transaction.package?._id,
          packageTitle: transaction.package?.title || "Package Purchase",
          customerName: transaction.user.name || transaction.user.email,
          customerEmail: transaction.user.email,
          commissionRate: 65,
        })

        console.log(`   ✅ Added Tier 1 commission: ₹${tier1Commission}`)
      } catch (error) {
        console.error(`   ❌ Error adding Tier 1 commission:`, error)
      }

      // Check for Tier 2 commission
      const tier1User = await User.findById(transaction.user.referredBy)
      if (tier1User?.referredBy) {
        const tier2Commission = Math.floor(transaction.amount * 0.05)

        try {
          await BalanceService.addCommission({
            userId: tier1User.referredBy,
            amount: tier2Commission,
            tier: 2,
            transactionId: transaction._id,
            packageId: transaction.package?._id,
            packageTitle: transaction.package?.title || "Package Purchase",
            customerName: transaction.user.name || transaction.user.email,
            customerEmail: transaction.user.email,
            commissionRate: 5,
          })

          console.log(`   ✅ Added Tier 2 commission: ₹${tier2Commission}`)
        } catch (error) {
          console.error(`   ❌ Error adding Tier 2 commission:`, error)
        }
      }
    }

    // Now sync all user balances
    console.log("\n🔄 Syncing all user balances...")

    const userIds = await BalanceTransaction.distinct("user", {
      type: "credit",
      category: "commission",
    })

    for (const userId of userIds) {
      try {
        await BalanceService.syncUserBalance(userId)
        console.log(`✅ Synced balance for user: ${userId}`)
      } catch (error) {
        console.error(`❌ Error syncing balance for user ${userId}:`, error)
      }
    }

    console.log("\n✅ Comprehensive commission sync completed!")

    // Generate summary report
    const totalCommissions = await BalanceTransaction.aggregate([
      {
        $match: {
          type: "credit",
          category: "commission",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          tier1Total: {
            $sum: {
              $cond: [{ $eq: ["$metadata.tier", 1] }, "$amount", 0],
            },
          },
          tier2Total: {
            $sum: {
              $cond: [{ $eq: ["$metadata.tier", 2] }, "$amount", 0],
            },
          },
        },
      },
    ])

    if (totalCommissions.length > 0) {
      const summary = totalCommissions[0]
      console.log("\n📊 COMMISSION SUMMARY:")
      console.log(`   Total Commissions: ₹${summary.totalAmount}`)
      console.log(`   Total Transactions: ${summary.totalTransactions}`)
      console.log(`   Tier 1 Total: ₹${summary.tier1Total}`)
      console.log(`   Tier 2 Total: ₹${summary.tier2Total}`)
    }
  } catch (error) {
    console.error("❌ Error in comprehensive commission sync:", error)
  }
}

// Run the sync
comprehensiveCommissionSync()
