import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    console.log("Connected to MongoDB for referrals leaderboard")

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log(`Fetching referrals leaderboard with limit: ${limit}`)

    // Find users with referrals and sort by count
    const users = await User.aggregate([
      { $match: { referredUsers: { $exists: true, $ne: [] } } },
      {
        $project: {
          name: 1,
          email: 1,
          username: 1,
          image: 1,
          referralCount: { $size: { $ifNull: ["$referredUsers", []] } },
        },
      },
      { $sort: { referralCount: -1 } },
      { $limit: limit },
    ])

    console.log(`Found ${users.length} users with referrals`)

    // Format leaderboard data
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name || "Anonymous",
      username: user.username || "user",
      image: user.image,
      email: user.email,
      referrals: user.referralCount,
    }))

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
