import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { referralCode } = await req.json()

    // Validate referral code
    if (!referralCode || referralCode.length < 6) {
      return NextResponse.json(
        { success: false, message: "Invalid referral code. Code must be at least 6 characters." },
        { status: 400 },
      )
    }

    // Check if code already exists
    const existingCode = await User.findOne({ referralCode })
    if (existingCode) {
      return NextResponse.json(
        { success: false, message: "This referral code is already in use. Please try another." },
        { status: 400 },
      )
    }

    // Find user and update referral code
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Only update if user doesn't already have a referral code
    if (user.referralCode) {
      return NextResponse.json({
        success: true,
        message: "You already have a referral code",
        referralCode: user.referralCode,
      })
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

export async function GET() {
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

    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
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
    }

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
    })
  } catch (error) {
    console.error("Error fetching referral code:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch referral code. Please try again." },
      { status: 500 },
    )
  }
}
