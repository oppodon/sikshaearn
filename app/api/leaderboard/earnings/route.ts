import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AffiliateEarning from "@/models/AffiliateEarning"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get("period") || "all" // all, month, week
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Build date filter based on period
    const dateFilter: any = {}
    if (period === "month") {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      dateFilter.createdAt = { $gte: startOfMonth }
    } else if (period === "week") {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      dateFilter.createdAt = { $gte: startOfWeek }
    }

    // Aggregate earnings by user
    const topAffiliates = await AffiliateEarning.aggregate([
      { $match: { ...dateFilter, status: { $in: ["available", "withdrawn", "processing"] } } },
      {
        $group: {
          _id: "$user",
          totalEarnings: { $sum: "$amount" },
          directEarnings: {
            $sum: {
              $cond: [{ $eq: ["$tier", 1] }, "$amount", 0],
            },
          },
          tier2Earnings: {
            $sum: {
              $cond: [{ $eq: ["$tier", 2] }, "$amount", 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
    ])

    // Get user details
    const userIds = topAffiliates.map((affiliate) => affiliate._id)
    const users = await User.find({ _id: { $in: userIds } })
      .select("name email image username")
      .lean()

    // Format leaderboard data
    const leaderboard = topAffiliates.map((affiliate, index) => {
      const user = users.find((u) => u._id.toString() === affiliate._id.toString())
      return {
        rank: index + 1,
        id: affiliate._id,
        name: user?.name || "Anonymous",
        username: user?.username || "user",
        image: user?.image,
        email: user?.email,
        totalEarnings: affiliate.totalEarnings,
        directEarnings: affiliate.directEarnings,
        tier2Earnings: affiliate.tier2Earnings,
        transactionCount: affiliate.count,
      }
    })

    return NextResponse.json({
      leaderboard,
      period,
    })
  } catch (error) {
    console.error("Error fetching earnings leaderboard:", error)
    return NextResponse.json({ message: "Failed to fetch earnings leaderboard" }, { status: 500 })
  }
}
