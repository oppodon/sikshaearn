import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { BalanceService } from "@/lib/balance-service"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const balanceData = await BalanceService.getBalanceSummary(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        balance: balanceData.balance,
        recentTransactions: balanceData.recentTransactions,
      },
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ message: "Failed to fetch balance" }, { status: 500 })
  }
}
