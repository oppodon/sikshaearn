import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    const { referralCode } = await req.json()

    if (!referralCode) {
      return NextResponse.json({ success: false, message: "Referral code is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the user with this referral code
    const user = await User.findOne({ referralCode })

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid referral code" }, { status: 404 })
    }

    // Increment referral clicks
    user.referralClicks = (user.referralClicks || 0) + 1

    // Add to referral activity
    if (!user.referralActivity) {
      user.referralActivity = []
    }

    user.referralActivity.push({
      action: "click",
      timestamp: new Date(),
      details: {
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    await user.save()

    return NextResponse.json({ success: true, message: "Referral click tracked successfully" })
  } catch (error) {
    console.error("Error tracking referral click:", error)
    return NextResponse.json({ success: false, message: "Failed to track referral click" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const referralCode = url.searchParams.get("ref")

    if (!referralCode) {
      return NextResponse.json({ success: false, message: "Referral code is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the user with this referral code
    const user = await User.findOne({ referralCode })

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid referral code" }, { status: 404 })
    }

    // Increment referral clicks
    user.referralClicks = (user.referralClicks || 0) + 1

    // Add to referral activity
    if (!user.referralActivity) {
      user.referralActivity = []
    }

    user.referralActivity.push({
      action: "click",
      timestamp: new Date(),
      details: {
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    await user.save()

    // Redirect to homepage with referral code in cookie
    const response = NextResponse.redirect(new URL("/packages", req.url))
    response.cookies.set("referralCode", referralCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error tracking referral click:", error)
    return NextResponse.json({ success: false, message: "Failed to track referral click" }, { status: 500 })
  }
}
