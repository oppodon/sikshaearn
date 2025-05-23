import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    // Get monthly top performers
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfMonth = new Date(currentYear, currentMonth, 0)

    const monthlyTopPerformers = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          affiliateId: { $exists: true },
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$affiliateId",
          totalEarnings: { $sum: "$affiliateCommission" },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
    ])

    // Get user details for monthly top performers
    const monthlyPerformerIds = monthlyTopPerformers.map((performer) => performer._id)
    const monthlyPerformerUsers = await User.find({ _id: { $in: monthlyPerformerIds } })
      .select("name email image username")
      .lean()

    // Format monthly leaderboard
    const monthlyLeaderboard = monthlyTopPerformers.map((performer, index) => {
      const user = monthlyPerformerUsers.find((u) => u._id.toString() === performer._id.toString())
      return {
        rank: index + 1,
        id: performer._id,
        name: user?.name || "Anonymous",
        username: user?.username || "user",
        image: user?.image,
        email: user?.email,
        earnings: performer.totalEarnings,
        sales: performer.totalSales,
      }
    })

    return NextResponse.json({
      success: true,
      leaderboard: monthlyLeaderboard,
    })
  } catch (error) {
    console.error("Error fetching monthly leaderboard:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch monthly leaderboard" }, { status: 500 })
  }
}
