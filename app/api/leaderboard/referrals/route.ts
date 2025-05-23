import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get top affiliates by referrals
    const topAffiliatesByReferrals = await User.aggregate([
      {
        $match: {
          referredUsers: { $exists: true, $ne: [] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          image: 1,
          email: 1,
          referralCount: { $size: "$referredUsers" },
        },
      },
      { $sort: { referralCount: -1 } },
      { $limit: limit },
    ])

    // Format referrals leaderboard
    const leaderboard = topAffiliatesByReferrals.map((affiliate, index) => ({
      rank: index + 1,
      id: affiliate._id,
      name: affiliate.name || "Anonymous",
      username: affiliate.username || "user",
      image: affiliate.image,
      email: affiliate.email,
      referrals: affiliate.referralCount,
    }))

    return NextResponse.json({
      leaderboard,
    })
  } catch (error) {
    console.error("Error fetching referrals leaderboard:", error)
    return NextResponse.json({ message: "Failed to fetch referrals leaderboard" }, { status: 500 })
  }
}
