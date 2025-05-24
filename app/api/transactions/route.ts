import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Transaction, User, Package } from "@/lib/models"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const transactions = await Transaction.find({ user: session.user.id })
      .populate("package", "title slug price")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, transactions }, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching transactions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions. Please try again." },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Creating new transaction")

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    const formData = await req.formData()
    const packageId = formData.get("packageId") as string
    const amount = formData.get("amount") as string
    const paymentMethodId = formData.get("paymentMethodId") as string
    const referralCode = formData.get("referralCode") as string
    const paymentProofFile = formData.get("paymentProof") as File

    console.log("📋 Transaction data:", { packageId, amount, paymentMethodId, referralCode })

    if (!packageId || !amount || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: packageId, amount, and paymentMethodId are required" },
        { status: 400 },
      )
    }

    // Upload payment proof if provided
    let paymentProofUrl = null
    if (paymentProofFile && paymentProofFile.size > 0) {
      try {
        const paymentProofResult = await uploadToCloudinary(
          await paymentProofFile.arrayBuffer(),
          `payments/${session.user.id}/${Date.now()}`,
          paymentProofFile.type,
        )
        paymentProofUrl = paymentProofResult?.secure_url || null
        console.log("📸 Payment proof uploaded:", paymentProofUrl)
      } catch (error) {
        console.error("❌ Error uploading payment proof:", error)
      }
    }

    // Get package data
    const packageData = await Package.findById(packageId).lean()
    if (!packageData) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 })
    }

    console.log("📦 Package found:", packageData.title, "Price:", packageData.price)

    // Get user data
    const user = await User.findById(session.user.id).lean()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

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
        await User.findByIdAndUpdate(session.user.id, { referredBy: referrer._id })
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
      user: session.user.id,
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

    return NextResponse.json({ success: true, transaction }, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create transaction. Please try again." },
      { status: 500 },
    )
  }
}
