import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import KYC from "@/models/KYC"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const documentType = searchParams.get("documentType") || ""
    const search = searchParams.get("search") || ""

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (documentType && documentType !== "all") {
      query.documentType = documentType
    }

    if (search) {
      // Search by document number or user information
      query.$or = [
        { documentNumber: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count
    const totalCount = await KYC.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limit)

    // Get KYC submissions with pagination
    const kycSubmissions = await KYC.find(query)
      .populate("userId", "name email image")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log("KYC submissions found:", kycSubmissions.length)

    return NextResponse.json({
      kycSubmissions,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("Error in KYC admin API:", error)
    return NextResponse.json({ error: "An error occurred while fetching KYC submissions" }, { status: 500 })
  }
}
