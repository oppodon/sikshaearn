import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AffiliateEarning from "@/models/AffiliateEarning"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    console.log("Connected to MongoDB for earnings leaderboard")

    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get("period") || "all" // all, month, week
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log(`Fetching earnings leaderboard for period: ${period}, limit: ${limit}`)

    // Build date filter based on period
    const dateFilter: any = {}
    if (period === "month") {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      dateFilter.createdAt = { $gte: startOfMonth }
      console.log("Date filter for month:", startOfMonth)
    } else if (period === "week") {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      dateFilter.createdAt = { $gte: startOfWeek }
      console.log("Date filter for week:", startOfWeek)
    }

    // Aggregate earnings by user
    console.log("Running aggregation pipeline with filter:", dateFilter)
    const topAffiliates = await AffiliateEarning.aggregate([
      { $match: { ...dateFilter, status: { $in: ["available", "pending", "withdrawn", "processing"] } } },
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

    console.log(`Found ${topAffiliates.length} top affiliates`)

    // Get user details
    const userIds = topAffiliates.map((affiliate) => affiliate._id)
    console.log("Fetching user details for IDs:", userIds)

    const users = await User.find({ _id: { $in: userIds } })
      .select("name email image username")
      .lean()

    console.log(`Found ${users.length} users`)

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

    console.log("Returning leaderboard with entries:", leaderboard.length)
    return NextResponse.json({
      leaderboard,
      period,
    })
  } catch (error) {
    console.error("Error fetching earnings leaderboard:", error)
    return NextResponse.json({ message: "Failed to fetch earnings leaderboard", error: String(error) }, { status: 500 })
  }
}
