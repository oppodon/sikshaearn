import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Balance from "@/models/Balance"
import AffiliateEarning from "@/models/AffiliateEarning"
import BalanceTransaction from "@/models/BalanceTransaction"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await dbConnect()
    console.log("Connected to MongoDB for moving pending balances to available")

    // Get request body
    const body = await req.json()
    const { userId } = body

    // If userId is provided, only update that user's balance
    const filter = userId ? { user: userId } : {}
    console.log("Using filter:", filter)

    // Find all pending earnings
    const pendingEarnings = await AffiliateEarning.find({
      ...filter,
      status: "pending",
    })

    console.log(`Found ${pendingEarnings.length} pending earnings`)

    if (pendingEarnings.length === 0) {
      return NextResponse.json({ message: "No pending earnings found" })
    }

    // Group earnings by user
    const earningsByUser = pendingEarnings.reduce(
      (acc, earning) => {
        const userId = earning.user.toString()
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            earnings: [],
            totalAmount: 0,
          }
        }
        acc[userId].earnings.push(earning)
        acc[userId].totalAmount += earning.amount
        return acc
      },
      {} as Record<string, { userId: string; earnings: typeof pendingEarnings; totalAmount: number }>,
    )

    console.log(`Grouped earnings for ${Object.keys(earningsByUser).length} users`)

    // Process each user's earnings
    const results = await Promise.all(
      Object.values(earningsByUser).map(async ({ userId, earnings, totalAmount }) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
          // Update balance
          const balance = await Balance.findOneAndUpdate(
            { user: userId },
            {
              $inc: {
                available: totalAmount,
                pending: -totalAmount,
              },
            },
            { new: true, upsert: true, session },
          )

          console.log(`Updated balance for user ${userId}:`, balance)

          // Update earnings status
          const earningIds = earnings.map((e) => e._id)
          await AffiliateEarning.updateMany(
            { _id: { $in: earningIds } },
            { $set: { status: "available" } },
            { session },
          )

          console.log(`Updated ${earningIds.length} earnings to available status`)

          // Create balance transaction record
          await BalanceTransaction.create(
            [
              {
                user: userId,
                amount: totalAmount,
                type: "credit",
                description: "Pending earnings moved to available balance",
                status: "completed",
                metadata: {
                  earningIds: earningIds.map((id) => id.toString()),
                  operation: "move-pending-to-available",
                },
              },
            ],
            { session },
          )

          console.log(`Created balance transaction record for user ${userId}`)

          await session.commitTransaction()
          return { userId, success: true, amount: totalAmount }
        } catch (error) {
          await session.abortTransaction()
          console.error(`Error processing user ${userId}:`, error)
          return { userId, success: false, error: String(error) }
        } finally {
          session.endSession()
        }
      }),
    )

    console.log("Processed results:", results)
    return NextResponse.json({
      message: "Pending balances moved to available",
      results,
    })
  } catch (error) {
    console.error("Error moving pending balances to available:", error)
    return NextResponse.json(
      { message: "Failed to move pending balances to available", error: String(error) },
      { status: 500 },
    )
  }
}

// Import mongoose for transactions
import mongoose from "mongoose"
