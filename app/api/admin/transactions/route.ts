import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Transaction } from "@/lib/models"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Ensure all models are registered
    ensureModelsRegistered()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const query: any = {}
    if (status && status !== "all" && status !== "") {
      if (status === "pending") {
        query.status = { $in: ["pending", "pending_verification"] }
      } else {
        query.status = status
      }
    }

    console.log("Fetching transactions with query:", query)

    const transactions = await Transaction.find(query)
      .populate("user", "name email")
      .populate("package", "title")
      .sort({ createdAt: -1 })
      .lean()

    console.log(`Found ${transactions.length} transactions`)

    // Transform data for frontend
    const transformedTransactions = transactions.map((transaction) => ({
      _id: transaction._id,
      userId: transaction.user?._id,
      userName: transaction.user?.name || "Unknown User",
      userEmail: transaction.user?.email || "No Email",
      packageName: transaction.package?.title || "Unknown Package",
      amount: transaction.amount,
      status: transaction.status,
      paymentMethodId: transaction.paymentMethodId,
      paymentProof: transaction.paymentProof,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
      reference: transaction._id.toString().slice(-8),
      method: "Online Payment",
      affiliateId: transaction.affiliateId,
      affiliateCommission: transaction.affiliateCommission,
      tier2AffiliateId: transaction.tier2AffiliateId,
      tier2Commission: transaction.tier2Commission,
    }))

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
    })
  } catch (error) {
    console.error("Error fetching admin transactions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
