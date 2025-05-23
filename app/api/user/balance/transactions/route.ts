import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import BalanceTransaction from "@/models/BalanceTransaction"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || null
    const type = searchParams.get("type") || null
    const category = searchParams.get("category") || null

    const skip = (page - 1) * limit

    // Build query
    const query: any = { user: session.user.id }
    if (status) query.status = status
    if (type) query.type = type
    if (category) query.category = category

    // Get transactions
    const transactions = await BalanceTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("metadata.packageId", "title")
      .lean()

    // Get total count
    const total = await BalanceTransaction.countDocuments(query)

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching balance transactions:", error)
    return NextResponse.json({ error: "Failed to fetch balance transactions", details: error.message }, { status: 500 })
  }
}
