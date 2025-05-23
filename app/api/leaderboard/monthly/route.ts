import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AffiliateEarning from "@/models/AffiliateEarning"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    console.log("Connected to MongoDB for monthly leaderboard")

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = Number.parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

    console.log(`Fetching monthly leaderboard for ${year}-${month} with limit: ${limit}`)

    // Calculate start and end dates for the specified month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    endDate.setHours(23, 59, 59, 999)

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)

    // Aggregate earnings by user for the specified month
    const topAffiliates = await AffiliateEarning.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["available", "pending", "withdrawn", "processing"] },
        },
      },
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

    console.log(`Found ${topAffiliates.length} top affiliates for the month`)

    // Get user details
    const userIds = topAffiliates.map((affiliate) => affiliate._id)
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

    console.log("Returning monthly leaderboard with entries:", leaderboard.length)
    return NextResponse.json({
      leaderboard,
      year,
      month,
    })
  } catch (error) {
    console.error("Error fetching monthly leaderboard:", error)
    return NextResponse.json({ message: "Failed to fetch monthly leaderboard", error: String(error) }, { status: 500 })
  }
}
