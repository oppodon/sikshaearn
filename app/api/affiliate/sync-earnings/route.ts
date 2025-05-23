import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import AffiliateEarning from "@/models/AffiliateEarning"
import { BalanceService } from "@/lib/balance-service"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get all affiliate earnings for the user
    const earnings = await AffiliateEarning.find({ user: session.user.id }).lean()

    // Get current balance
    const balance = await BalanceService.getOrCreateBalance(session.user.id)

    // Calculate total earnings from affiliate earnings
    const totalFromEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)

    // Update balance
    balance.totalEarnings = totalFromEarnings

    // For testing purposes, move all to available balance
    // In production, you might want to check the 14-day rule
    balance.availableBalance = totalFromEarnings
    balance.pendingBalance = 0
    balance.lastUpdated = new Date()

    await balance.save()

    return NextResponse.json({
      message: "Balance synced successfully",
      balance: {
        totalEarnings: balance.totalEarnings,
        availableBalance: balance.availableBalance,
        pendingBalance: balance.pendingBalance,
        processingBalance: balance.processingBalance,
        withdrawnBalance: balance.withdrawnBalance,
      },
    })
  } catch (error) {
    console.error("Error syncing balance:", error)
    return NextResponse.json({ message: "Failed to sync balance", error: error.message }, { status: 500 })
  }
}
