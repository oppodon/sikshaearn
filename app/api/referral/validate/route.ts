import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, error: "Referral code is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find user by referral code
    const referrer = await User.findOne({ referralCode: code }).select("_id name email referralCode").lean()

    if (!referrer) {
      return NextResponse.json({ success: false, error: "Invalid referral code" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      referrer: {
        id: referrer._id.toString(),
        name: referrer.name,
        email: referrer.email,
      },
    })
  } catch (error) {
    console.error("Error validating referral code:", error)
    return NextResponse.json({ success: false, error: "Failed to validate referral code" }, { status: 500 })
  }
}
