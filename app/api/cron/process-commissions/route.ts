import { NextResponse } from "next/server"
import { BalanceService } from "@/lib/balance-service"
import dbConnect from "@/lib/mongodb"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: Request) {
  try {
    // Check for secret token to prevent unauthorized access
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Process pending commissions
    const result = await BalanceService.processPendingCommissions()

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} pending commissions`,
      processed: result.processed,
    })
  } catch (error) {
    console.error("Error processing commissions:", error)
    return NextResponse.json({ error: "Failed to process commissions" }, { status: 500 })
  }
}
