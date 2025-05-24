import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Fetching user stats...")

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    await ensureModelsRegistered()

    const userId = session.user.id
    console.log("👤 User ID:", userId)

    // Import models
    const { default: Balance } = await import("@/models/Balance")
    const { default: BalanceTransaction } = await import("@/models/BalanceTransaction")
    const { default: User } = await import("@/models/User")
    const { default: Enrollment } = await import("@/models/Enrollment")

    // Get user balance
    const balance = (await Balance.findOne({ user: userId })) || {
      available: 0,
      pending: 0,
      processing: 0,
      withdrawn: 0,
    }

    // Get total earnings from balance transactions
    const totalEarnings = await BalanceTransaction.aggregate([
      { $match: { user: userId, status: "completed", type: "credit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    // Get referral count
    const referralCount = await User.countDocuments({ referredBy: userId })

    // Get enrolled courses count
    const enrolledCoursesCount = await Enrollment.countDocuments({ user: userId })

    const stats = {
      totalCourses: enrolledCoursesCount,
      completedCourses: 0, // TODO: Calculate based on progress
      totalEarnings: totalEarnings[0]?.total || 0,
      referrals: referralCount,
      balance: {
        available: balance.available || 0,
        pending: balance.pending || 0,
        processing: balance.processing || 0,
        withdrawn: balance.withdrawn || 0,
      },
    }

    console.log("📈 User stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
