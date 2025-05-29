import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Transaction, User, Package } from "@/lib/models"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Starting transaction creation process")

    const session = await getServerSession(authOptions)
    console.log("👤 Session status:", session ? "Authenticated" : "Not authenticated")

    const formData = await req.formData()
    const userEmail = formData.get("userEmail") as string
    const packageId = formData.get("packageId") as string
    const amount = formData.get("amount") as string
    const paymentMethodId = formData.get("paymentMethodId") as string
    const referralCode = formData.get("referralCode") as string
    const paymentProofFile = formData.get("paymentProof") as File

    console.log("📋 Form data received:", {
      userEmail,
      packageId,
      amount,
      paymentMethodId,
      referralCode,
      hasPaymentProof: !!paymentProofFile,
    })

    // Validate required fields
    if (!packageId || !amount || !paymentMethodId) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { success: false, error: "Missing required fields: packageId, amount, and paymentMethodId are required" },
        { status: 400 },
      )
    }

    // Check authentication - either session or userEmail required
    if (!session && !userEmail) {
      console.log("❌ No authentication provided")
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    // Get user ID - either from session or by email lookup
    let userId: string
    let user: any

    if (session) {
      userId = session.user.id
      user = await User.findById(userId).lean()

      // If user not found by ID but email is provided, try by email
      if (!user && userEmail) {
        console.log("⚠️ User not found by ID, trying by email:", userEmail)
        user = await User.findOne({ email: userEmail }).lean()
        if (user) {
          userId = user._id.toString()
          console.log("✅ Found user by email instead:", userId)
        }
      }

      if (!user) {
        console.log("❌ User not found by ID:", userId)
        return NextResponse.json(
          { success: false, error: "User not found. Please try logging in again." },
          { status: 404 },
        )
      }

      console.log("👤 Using authenticated user:", userId)
    } else if (userEmail) {
      user = await User.findOne({ email: userEmail }).lean()
      if (!user) {
        console.log("❌ User not found with email:", userEmail)
        return NextResponse.json({ success: false, error: "User not found with provided email" }, { status: 404 })
      }
      userId = user._id.toString()
      console.log("👤 Found user by email:", userEmail, "ID:", userId)
    } else {
      console.log("❌ No user identification method provided")
      return NextResponse.json({ success: false, error: "User identification required" }, { status: 400 })
    }

    if (!user) {
      console.log("❌ User data not found")
      return NextResponse.json({ success: false, error: "User data not found" }, { status: 404 })
    }

    // Upload payment proof if provided
    let paymentProofUrl = null
    if (paymentProofFile && paymentProofFile.size > 0) {
      try {
        console.log("📤 Uploading payment proof...")
        const paymentProofResult = await uploadToCloudinary(
          await paymentProofFile.arrayBuffer(),
          `payments/${userId}-${Date.now()}`,
          paymentProofFile.type,
        )
        paymentProofUrl = paymentProofResult?.secure_url || null
        console.log("📸 Payment proof uploaded:", paymentProofUrl)
      } catch (error) {
        console.error("❌ Error uploading payment proof:", error)
        return NextResponse.json({ success: false, error: "Failed to upload payment proof" }, { status: 500 })
      }
    }

    // Get package data
    const packageData = await Package.findById(packageId).lean()
    if (!packageData) {
      console.log("❌ Package not found:", packageId)
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 })
    }

    console.log("📦 Package found:", packageData.title, "Price:", packageData.price)

    // Handle referral code
    let affiliateId = user.referredBy // Use existing referrer
    let affiliateCommission = 0
    let tier2AffiliateId = null
    let tier2Commission = 0

    // Process new referral code if user doesn't have one
    if (referralCode && !user.referredBy) {
      console.log("🔗 Processing referral code:", referralCode)

      const referrer = await User.findOne({ referralCode }).lean()
      if (referrer) {
        affiliateId = referrer._id
        // Update user's referredBy field
        await User.findByIdAndUpdate(userId, { referredBy: referrer._id })
        console.log("✅ Updated user referredBy to:", referrer._id)
      } else {
        console.log("⚠️ Referral code not found:", referralCode)
      }
    }

    // Calculate commissions if there's a referrer
    if (affiliateId) {
      affiliateCommission = Math.round(packageData.price * 0.65) // 65%

      // Check for tier 2 referrer
      const referrer = await User.findById(affiliateId).lean()
      if (referrer && referrer.referredBy) {
        tier2AffiliateId = referrer.referredBy
        tier2Commission = Math.round(packageData.price * 0.05) // 5%
      }
    }

    console.log("💰 Commission calculation:", {
      affiliateId,
      affiliateCommission,
      tier2AffiliateId,
      tier2Commission,
    })

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      package: packageId,
      amount: Number.parseFloat(amount),
      paymentMethodId,
      paymentProof: paymentProofUrl,
      status: "pending",
      affiliateId,
      affiliateCommission,
      tier2AffiliateId,
      tier2Commission,
    })

    console.log("✅ Transaction created successfully:", transaction._id)

    return NextResponse.json(
      {
        success: true,
        transaction: {
          _id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          paymentProof: transaction.paymentProof,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create transaction. Please try again." },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const transactions = await Transaction.find({ user: session.user.id })
      .populate("package", "title price")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, transactions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}
