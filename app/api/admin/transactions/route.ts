import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import User from "@/models/User"
import Package from "@/models/Package"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (search) {
      // Add search functionality
      query.$or = [{ reference: { $regex: search, $options: "i" } }, { _id: { $regex: search, $options: "i" } }]
    }

    // Find transactions
    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get user and package details for each transaction
    const enhancedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          // Get user details
          const user = await User.findById(transaction.user).select("name email").lean()

          // Get package details
          const packageData = await Package.findById(transaction.package).select("name title").lean()

          return {
            ...transaction,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || "No Email",
            packageName: packageData?.title || packageData?.name || "Unknown Package",
          }
        } catch (error) {
          console.error("Error enhancing transaction:", error)
          return {
            ...transaction,
            userName: "Error fetching user",
            userEmail: "Error fetching email",
            packageName: "Error fetching package",
          }
        }
      }),
    )

    // Count total transactions for pagination
    const total = await Transaction.countDocuments(query)

    return NextResponse.json({
      transactions: enhancedTransactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
