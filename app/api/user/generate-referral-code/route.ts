import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if user already has a referral code
    if (user.referralCode) {
      return NextResponse.json({
        success: true,
        message: "You already have a referral code",
        referralCode: user.referralCode,
      })
    }

    // Generate unique referral code
    const generateReferralCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    let referralCode = generateReferralCode()
    let isUnique = false
    while (!isUnique) {
      const existingUser = await User.findOne({ referralCode })
      if (!existingUser) {
        isUnique = true
      } else {
        referralCode = generateReferralCode()
      }
    }

    user.referralCode = referralCode
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Referral code generated successfully",
      referralCode: user.referralCode,
    })
  } catch (error) {
    console.error("Error generating referral code:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate referral code. Please try again." },
      { status: 500 },
    )
  }
}
