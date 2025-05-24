import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, User } from "@/lib/models"
import { BalanceService } from "@/lib/balance-service"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    console.log("🔄 Starting balance sync for all users...")

    // Get all users
    const users = await User.find({}).select("_id email")
    console.log(`👥 Found ${users.length} users to sync`)

    let syncedCount = 0
    const results = []

    for (const user of users) {
      try {
        const balance = await BalanceService.syncUserBalance(user._id)
        syncedCount++
        results.push({
          userId: user._id,
          email: user.email,
          balance: balance.availableBalance,
          status: "synced",
        })
        console.log(`✅ Synced balance for ${user.email}: ₹${balance.availableBalance}`)
      } catch (error) {
        console.error(`❌ Failed to sync balance for ${user.email}:`, error)
        results.push({
          userId: user._id,
          email: user.email,
          status: "failed",
          error: String(error),
        })
      }
    }

    console.log(`✅ Balance sync completed: ${syncedCount}/${users.length} users synced`)

    return NextResponse.json({
      message: "Balance sync completed",
      totalUsers: users.length,
      syncedUsers: syncedCount,
      results,
    })
  } catch (error) {
    console.error("❌ Error syncing balances:", error)
    return NextResponse.json({ message: "Failed to sync balances", error: String(error) }, { status: 500 })
  }
}
