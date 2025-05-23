import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import Package from "@/models/Package"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "4")

    // Get top performing products
    const topProducts = await Transaction.aggregate([
      { $match: { affiliateId: session.user.id, status: "completed" } },
      {
        $group: {
          _id: "$package",
          sales: { $sum: 1 },
          commission: { $sum: "$affiliateCommission" },
        },
      },
      { $sort: { commission: -1 } },
      { $limit: limit },
    ])

    // Get package details for top products
    const packageIds = topProducts.map((product) => product._id)
    const packages = await Package.find({ _id: { $in: packageIds } }).lean()

    const formattedTopProducts = topProducts.map((product) => {
      const packageData = packages.find((p) => p._id.toString() === product._id.toString())
      return {
        id: product._id,
        name: packageData?.title || "Unknown Package",
        sales: product.sales,
        commission: product.commission,
      }
    })

    return NextResponse.json({
      success: true,
      products: formattedTopProducts,
    })
  } catch (error) {
    console.error("Error fetching top products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch top products" }, { status: 500 })
  }
}
