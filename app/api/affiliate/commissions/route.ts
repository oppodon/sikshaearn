import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    // Get recent commissions
    const recentCommissions = await Transaction.find({
      affiliateId: session.user.id,
      status: { $in: ["completed", "pending"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "email")
      .populate("package", "title")
      .lean()

    // Format recent commissions
    const formattedCommissions = recentCommissions.map((commission) => ({
      id: commission._id,
      date: new Date(commission.createdAt).toISOString().split("T")[0],
      product: commission.package?.title || "Package",
      customer: commission.user?.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") || "Anonymous",
      amount: commission.affiliateCommission,
      status: commission.status === "completed" ? "Paid" : "Pending",
    }))

    return NextResponse.json({
      success: true,
      commissions: formattedCommissions,
    })
  } catch (error) {
    console.error("Error fetching commissions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch commissions" }, { status: 500 })
  }
}
