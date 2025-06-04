import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type")
    let userData: any = {}
    let profileImageFile: File | null = null

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (with potential file upload)
      const formData = await req.formData()

      userData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        referralCode: formData.get("referralCode") as string,
        phone: formData.get("phone") as string,
        country: formData.get("country") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        skipEmailVerification: formData.get("skipEmailVerification") === "true",
      }

      profileImageFile = formData.get("profileImage") as File
    } else {
      // Handle JSON data
      userData = await req.json()
    }

    const { name, email, password, referralCode, phone, country, city, address, skipEmailVerification } = userData

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all required fields (name, email, and password)" },
        { status: 400 },
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Removed password validation - allowing any password format

    // Validate profile image if provided
    if (profileImageFile && profileImageFile.size > 0) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (profileImageFile.size > maxSize) {
        return NextResponse.json(
          {
            error: "Profile image size must be less than 5MB. Please choose a smaller image.",
          },
          { status: 400 },
        )
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(profileImageFile.type)) {
        return NextResponse.json(
          {
            error: "Profile image must be in JPEG, PNG, or WebP format",
          },
          { status: 400 },
        )
      }
    }

    // Connect to database
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email address already exists. Please use a different email or try logging in.",
        },
        { status: 409 },
      )
    }

    // Check referral code if provided
    let referredBy = null
    if (referralCode && referralCode.trim()) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() })
      if (!referrer) {
        return NextResponse.json(
          {
            error: "Invalid referral code. Please check the code and try again.",
          },
          { status: 400 },
        )
      }
      referredBy = referrer._id

      // Track referral click
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralClicks: 1 },
        $addToSet: { referredUsers: [] },
      })
    }

    // Generate unique referral code
    const generateReferralCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    let referralCodeGen = generateReferralCode()
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 10) {
      const existingUser = await User.findOne({ referralCode: referralCodeGen })
      if (!existingUser) {
        isUnique = true
      } else {
        referralCodeGen = generateReferralCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        {
          error: "Unable to generate a unique referral code. Please try again.",
        },
        { status: 500 },
      )
    }

    // Handle profile image upload if provided
    let profileImageUrl = null
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        const uploadResult = await uploadImage(profileImageFile, "user-profiles")
        profileImageUrl = uploadResult.url
      } catch (uploadError: any) {
        console.error("Error uploading profile image:", uploadError)
        return NextResponse.json(
          {
            error: `Failed to upload profile image: ${uploadError.message || "Unknown error"}. Please try again with a different image.`,
          },
          { status: 500 },
        )
      }
    }

    // Create new user - automatically active and verified when skipEmailVerification is true
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      referredBy,
      referralCode: referralCodeGen,
      status: "active", // Always active
      emailVerified: skipEmailVerification ? true : false, // Skip verification if requested
      phone: phone?.trim() || "",
      country: country?.trim() || "",
      city: city?.trim() || "",
      address: address?.trim() || "",
      image: profileImageUrl, // Set profile image if uploaded
    })

    await newUser.save()

    // Update referrer's referred users list
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, { $addToSet: { referredUsers: newUser._id } })
    }

    // Only send verification email if not skipping
    if (!skipEmailVerification) {
      // Send verification email logic would go here
      // For now, we're skipping this entirely for checkout registrations
    }

    return NextResponse.json(
      {
        message: skipEmailVerification
          ? "Account created successfully! You can now start learning."
          : "Account created successfully! Please check your email for verification.",
        userId: newUser._id,
        profileImage: profileImageUrl,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      if (field === "email") {
        return NextResponse.json(
          {
            error: "An account with this email address already exists. Please use a different email.",
          },
          { status: 409 },
        )
      } else if (field === "referralCode") {
        return NextResponse.json(
          {
            error: "Unable to generate a unique referral code. Please try again.",
          },
          { status: 500 },
        )
      }
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        {
          error: `Validation failed: ${validationErrors.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Handle network/connection errors
    if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
      return NextResponse.json(
        {
          error: "Database connection failed. Please try again in a moment.",
        },
        { status: 503 },
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Failed to create account. Please try again or contact support if the problem persists.",
      },
      { status: 500 },
    )
  }
}
