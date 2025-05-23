import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { sendVerificationEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date()
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24) // Token valid for 24 hours

    // Check referral code if provided
    let referredBy = null
    if (referralCode) {
      const referrer = await User.findOne({ referralCode })
      if (referrer) {
        referredBy = referrer._id

        // Track referral click
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { referralClicks: 1 },
          $addToSet: { referredUsers: [] }, // Initialize array if it doesn't exist
        })
      }
    }

    // Generate unique referral code
    const generateReferralCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    let referralCodeGen = generateReferralCode()
    let isUnique = false
    while (!isUnique) {
      const existingUser = await User.findOne({ referralCode: referralCodeGen })
      if (!existingUser) {
        isUnique = true
      } else {
        referralCodeGen = generateReferralCode()
      }
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiry,
      referredBy,
      referralCode: referralCodeGen, // Add this line
    })

    await newUser.save()

    // Update referrer's referred users list
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, { $addToSet: { referredUsers: newUser._id } })
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        message: "User registered successfully. Please check your email to verify your account.",
        userId: newUser._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
