import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import AffiliateEarning from "@/models/AffiliateEarning"
import { BalanceService } from "@/lib/balance-service"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build query based on status
    const query: any = { user: session.user.id }
    if (status !== "all") {
      query.status = status
    }

    // Get total count for pagination
    const total = await AffiliateEarning.countDocuments(query)

    // Get earnings with pagination
    const earnings = await AffiliateEarning.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "transaction",
        select: "user package amount createdAt",
        populate: [
          {
            path: "user",
            select: "name email",
          },
          {
            path: "package",
            select: "title price",
          },
        ],
      })
      .lean()

    // Get balance information from Balance model
    const balance = await BalanceService.getOrCreateBalance(session.user.id)

    const earningsSummary = {
      pending: balance.pendingBalance || 0,
      available: balance.availableBalance || 0,
      withdrawn: balance.withdrawnBalance || 0,
      processing: balance.processingBalance || 0,
      total: balance.totalEarnings || 0,
    }

    // Format earnings for response
    const formattedEarnings = earnings.map((earning) => ({
      id: earning._id,
      amount: earning.amount,
      status: earning.status,
      tier: earning.tier,
      createdAt: earning.createdAt,
      transaction: earning.transaction
        ? {
            id: earning.transaction._id,
            package: earning.transaction.package?.title || "Unknown Package",
            packageId: earning.transaction.package?._id,
            amount: earning.transaction.amount,
            date: earning.transaction.createdAt,
            customer: {
              name: earning.transaction.user?.name || "Unknown User",
              email: earning.transaction.user?.email
                ? earning.transaction.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
                : "unknown@email.com",
            },
          }
        : null,
    }))

    return NextResponse.json({
      earnings: formattedEarnings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      summary: earningsSummary,
    })
  } catch (error) {
    console.error("Error fetching affiliate earnings:", error)
    return NextResponse.json({ message: "Failed to fetch affiliate earnings" }, { status: 500 })
  }
}
