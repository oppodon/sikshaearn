import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, message: "Referral code is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the user with this referral code
    const referrer = await User.findOne({ referralCode: code })

    if (!referrer) {
      return NextResponse.json({ success: false, message: "Invalid referral code" }, { status: 404 })
    }

    // Return success with referrer information
    return NextResponse.json({
      success: true,
      message: "Valid referral code",
      referrer: {
        id: referrer._id,
        name: referrer.name,
        email: referrer.email,
      },
    })
  } catch (error) {
    console.error("Error validating referral code:", error)
    return NextResponse.json({ success: false, message: "Failed to validate referral code" }, { status: 500 })
  }
}
