import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { ensureModelsRegistered, Withdrawal, Balance, BalanceTransaction, User, KYC } from "@/lib/models"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    ensureModelsRegistered()

    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await Withdrawal.countDocuments({ user: session.user.id })

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      withdrawals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    return NextResponse.json({ message: "Failed to fetch withdrawals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    ensureModelsRegistered()

    console.log(`💸 Processing withdrawal request for user: ${session.user.id}`)

    // Check if user has completed KYC verification
    const kycStatus = await KYC.findOne({ userId: session.user.id }).lean()

    if (!kycStatus) {
      return NextResponse.json(
        {
          message: "KYC verification is required for withdrawals",
          kycRequired: true,
        },
        { status: 403 },
      )
    }

    if (kycStatus.status !== "approved") {
      return NextResponse.json(
        {
          message: `Your KYC verification is ${kycStatus.status}. Approved KYC is required for withdrawals.`,
          kycStatus: kycStatus.status,
          kycRequired: true,
        },
        { status: 403 },
      )
    }

    const { amount, method, accountDetails } = await req.json()

    // Validate input
    if (!amount || !method || !accountDetails) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ message: "Minimum withdrawal amount is Rs. 100" }, { status: 400 })
    }

    // Validate account details based on method
    if (method === "bank_transfer") {
      if (!accountDetails.accountName || !accountDetails.accountNumber || !accountDetails.bankName) {
        return NextResponse.json({ message: "Missing bank account details" }, { status: 400 })
      }
    } else if (method === "esewa" || method === "khalti") {
      if (!accountDetails.phoneNumber) {
        return NextResponse.json({ message: "Phone number is required for mobile payment methods" }, { status: 400 })
      }
    }

    // Get user's current balance
    const userBalance = await Balance.findOne({ user: session.user.id })

    if (!userBalance) {
      return NextResponse.json({ message: "No balance found. Please contact support." }, { status: 400 })
    }

    const availableBalance = Number(userBalance.available) || 0
    console.log(`💰 User available balance: ₹${availableBalance}, Requested: ₹${amount}`)

    if (availableBalance < amount) {
      return NextResponse.json(
        {
          message: `Insufficient available balance. Available: ₹${availableBalance}, Requested: ₹${amount}`,
        },
        { status: 400 },
      )
    }

    // Get user details for notification
    const user = await User.findById(session.user.id).select("name email").lean()

    try {
      // Create withdrawal request first
      const withdrawal = new Withdrawal({
        user: session.user.id,
        amount,
        method,
        accountDetails,
        status: "pending",
      })

      await withdrawal.save()

      // Update user balance - move from available to processing
      const updatedBalance = await Balance.findOneAndUpdate(
        { user: session.user.id },
        {
          $inc: {
            available: -amount,
            processing: amount,
          },
          $set: {
            lastSyncedAt: new Date(),
          },
        },
        { new: true },
      )

      if (!updatedBalance) {
        // If balance update failed, delete the withdrawal request
        await Withdrawal.findByIdAndDelete(withdrawal._id)
        return NextResponse.json({ message: "Failed to update balance. Please try again." }, { status: 500 })
      }

      // Create balance transaction record
      await BalanceTransaction.create({
        user: session.user.id,
        type: "debit",
        amount,
        description: `Withdrawal request - ${method}`,
        status: "pending",
        metadata: {
          withdrawalId: withdrawal._id,
          method,
          accountDetails,
        },
      })

      console.log(`✅ Withdrawal request created: ${withdrawal._id} for ₹${amount}`)

      return NextResponse.json({
        message: "Withdrawal request submitted successfully",
        withdrawal: {
          id: withdrawal._id,
          amount: withdrawal.amount,
          method: withdrawal.method,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
        },
      })
    } catch (error) {
      console.error("❌ Error in withdrawal process:", error)
      return NextResponse.json({ message: "Failed to create withdrawal request" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Error creating withdrawal request:", error)
    return NextResponse.json({ message: "Failed to create withdrawal request" }, { status: 500 })
  }
}
