import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Withdrawal from "@/models/Withdrawal"
import AffiliateEarning from "@/models/AffiliateEarning"
import User from "@/models/User"
import KYC from "@/models/KYC"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

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

    // Check if user has enough available balance
    const availableEarnings = await AffiliateEarning.find({
      user: session.user.id,
      status: "available",
      withdrawalId: null,
    })

    const availableBalance = availableEarnings.reduce((sum, earning) => sum + earning.amount, 0)

    if (availableBalance < amount) {
      return NextResponse.json({ message: "Insufficient available balance" }, { status: 400 })
    }

    // Get user details for notification
    const user = await User.findById(session.user.id).select("name email").lean()

    // Start a session for transaction
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      // Create withdrawal request
      const withdrawal = new Withdrawal({
        user: session.user.id,
        amount,
        method,
        accountDetails,
        status: "pending",
        earnings: [],
      })

      await withdrawal.save({ session: mongoSession })

      // Collect earnings for this withdrawal
      let remainingAmount = amount
      const earningsToUpdate = []

      for (const earning of availableEarnings) {
        if (remainingAmount <= 0) break

        earningsToUpdate.push(earning._id)
        withdrawal.earnings.push(earning._id)

        remainingAmount -= earning.amount
        if (remainingAmount < 0) {
          // This should never happen as we're only including whole earnings
          // But just in case, we'll handle it
          console.warn("Negative remaining amount in withdrawal processing:", remainingAmount)
        }
      }

      await withdrawal.save({ session: mongoSession })

      // Update earnings status to "withdrawn"
      await AffiliateEarning.updateMany(
        { _id: { $in: earningsToUpdate } },
        { status: "withdrawn", withdrawalId: withdrawal._id },
        { session: mongoSession },
      )

      // Update user's balance
      await User.findByIdAndUpdate(session.user.id, { $inc: { pendingWithdrawals: amount } }, { session: mongoSession })

      await mongoSession.commitTransaction()
      mongoSession.endSession()

      // Send notification to admin (in a real system, you'd use a notification service)
      console.log(`New withdrawal request from ${user?.name} (${user?.email}) for ${amount}`)

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
      await mongoSession.abortTransaction()
      mongoSession.endSession()
      throw error
    }
  } catch (error) {
    console.error("Error creating withdrawal request:", error)
    return NextResponse.json({ message: "Failed to create withdrawal request" }, { status: 500 })
  }
}
