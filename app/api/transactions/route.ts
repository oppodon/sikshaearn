import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import User from "@/models/User"
import Package from "@/models/Package"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get user's transactions
    const transactions = await Transaction.find({ user: session.user.id })
      .populate("package", "title slug price")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, transactions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions. Please try again." },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/transactions called")

    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Found" : "Not found")

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    console.log("Database connected")

    const formData = await req.formData()
    console.log("Form data received")

    const packageId = formData.get("packageId") as string
    const amount = formData.get("amount") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const referrerId = formData.get("referrerId") as string
    const paymentProofFile = formData.get("paymentProof") as File

    console.log("Form data:", { packageId, amount, paymentMethod, referrerId, hasPaymentProof: !!paymentProofFile })

    if (!packageId || !amount || !paymentMethod) {
      console.log("Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    let paymentProofUrl = null

    // Upload payment proof to Cloudinary if provided
    if (paymentProofFile && paymentProofFile.size > 0) {
      try {
        console.log("Uploading payment proof...")
        const paymentProofResult = await uploadToCloudinary(
          await paymentProofFile.arrayBuffer(),
          `payments/${session.user.id}/${Date.now()}`,
          paymentProofFile.type,
        )

        if (!paymentProofResult || !paymentProofResult.secure_url) {
          console.log("Failed to upload payment proof")
          return NextResponse.json({ success: false, error: "Failed to upload payment proof" }, { status: 500 })
        }

        paymentProofUrl = paymentProofResult.secure_url
        console.log("Payment proof uploaded:", paymentProofUrl)
      } catch (error) {
        console.error("Error uploading payment proof:", error)
        return NextResponse.json({ success: false, error: "Failed to upload payment proof" }, { status: 500 })
      }
    }

    // Get package price for commission calculation
    const packageData = await Package.findById(packageId).lean()
    if (!packageData) {
      console.log("Package not found:", packageId)
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 })
    }

    console.log("Package found:", packageData.title)

    // Get user to check for referrer
    const user = await User.findById(session.user.id).lean()
    if (!user) {
      console.log("User not found:", session.user.id)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log("User found:", user.email)

    // Calculate commissions
    let affiliateId = null
    let affiliateCommission = 0
    let tier2AffiliateId = null
    let tier2Commission = 0

    // Use provided referrerId or fall back to user's referredBy
    const finalReferrerId = referrerId || user.referredBy

    if (finalReferrerId) {
      console.log("Processing referral for:", finalReferrerId)
      // Direct referrer gets 65%
      affiliateId = finalReferrerId
      affiliateCommission = Math.round(packageData.price * 0.65)

      // Check if there's a tier 2 referrer (5%)
      const referrer = await User.findById(finalReferrerId).lean()
      if (referrer && referrer.referredBy) {
        tier2AffiliateId = referrer.referredBy
        tier2Commission = Math.round(packageData.price * 0.05)
        console.log("Tier 2 referrer found:", tier2AffiliateId)
      }

      // Update user's referredBy if it was provided in the transaction
      if (referrerId && !user.referredBy) {
        await User.findByIdAndUpdate(session.user.id, { referredBy: referrerId })
        console.log("Updated user referredBy")
      }
    }

    console.log("Creating transaction...")

    // Create transaction
    const transaction = await Transaction.create({
      user: session.user.id,
      package: packageId,
      amount: Number.parseFloat(amount),
      paymentMethod,
      paymentProof: paymentProofUrl,
      status: "pending",
      affiliateId,
      affiliateCommission,
      tier2AffiliateId,
      tier2Commission,
    })

    console.log("Transaction created:", transaction._id)

    return NextResponse.json({ success: true, transaction }, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create transaction. Please try again." },
      { status: 500 },
    )
  }
}
