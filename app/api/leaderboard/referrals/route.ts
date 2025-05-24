import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { ensureModelsRegistered, User, Transaction } from "@/lib/models"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    ensureModelsRegistered()

    console.log("Connected to MongoDB for referrals leaderboard")

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log(`Fetching referrals leaderboard with limit: ${limit}`)

    // Get referral counts from transactions
    const referralStats = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          affiliateId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$affiliateId",
          referralCount: { $sum: 1 },
          totalSales: { $sum: "$amount" },
          totalCommission: { $sum: "$affiliateCommission" },
        },
      },
      { $sort: { referralCount: -1 } },
      { $limit: limit },
    ])

    console.log(`Found ${referralStats.length} users with referral transactions`)

    // Get user details
    const userIds = referralStats.map((stat) => stat._id)
    const users = await User.find({ _id: { $in: userIds } })
      .select("name email username image")
      .lean()

    // Format leaderboard data
    const leaderboard = referralStats.map((stat, index) => {
      const user = users.find((u) => u._id.toString() === stat._id.toString())
      return {
        rank: index + 1,
        id: stat._id,
        name: user?.name || "Anonymous",
        username: user?.username || "user",
        image: user?.image,
        email: user?.email,
        referrals: stat.referralCount,
        totalSales: stat.totalSales,
        totalCommission: stat.totalCommission,
      }
    })

    console.log("Returning referrals leaderboard with entries:", leaderboard.length)
    return NextResponse.json({
      leaderboard,
    })
  } catch (error) {
    console.error("Error fetching referrals leaderboard:", error)
    return NextResponse.json(
      { message: "Failed to fetch referrals leaderboard", error: String(error) },
      { status: 500 },
    )
  }
}
