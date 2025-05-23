import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import KYC from "@/models/KYC"
import { safeAccess } from "./error-handler"

/**
 * Safely fetch transactions with proper error handling and data validation
 */
export async function fetchTransactions(
  options: {
    status?: string
    page?: number
    limit?: number
    search?: string
  } = {},
) {
  try {
    await dbConnect()

    const { status, page = 1, limit = 10, search } = options
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      // Search by ID or amount
      query.$or = [{ _id: { $regex: search, $options: "i" } }, { amount: { $regex: search, $options: "i" } }]
    }

    // Get total count for pagination
    const total = await Transaction.countDocuments(query)

    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .populate("user", "name email")
      .populate("package", "title slug price thumbnail")
      .populate("affiliateId", "name email")
      .populate("tier2AffiliateId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Process transactions to handle null values
    const processedTransactions = transactions.map((transaction) => {
      return {
        ...transaction,
        user: transaction.user || { name: "Unknown User", email: "No email available" },
        package: transaction.package || {
          title: "Unknown Package",
          slug: "",
          price: safeAccess(transaction, "amount", 0),
          thumbnail: "",
        },
      }
    })

    return {
      transactions: processedTransactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return {
      transactions: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    }
  }
}

/**
 * Safely fetch KYC submissions with proper error handling
 */
export async function fetchKYCSubmissions(
  options: {
    status?: string
    page?: number
    limit?: number
    search?: string
    documentType?: string
  } = {},
) {
  try {
    await dbConnect()

    const { status, page = 1, limit = 10, search, documentType } = options
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (status && status !== "all") {
      query.status = status
    }

    if (documentType && documentType !== "all") {
      query.documentType = documentType
    }

    if (search) {
      query.$or = [
        { documentNumber: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const totalCount = await KYC.countDocuments(query)

    // Get KYC submissions with pagination
    const kycSubmissions = await KYC.find(query)
      .populate("userId", "name email image")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Process KYC submissions to handle null values
    const processedSubmissions = kycSubmissions.map((submission) => {
      return {
        ...submission,
        userId: submission.userId || {
          name: "Unknown User",
          email: "No email available",
          image: null,
        },
      }
    })

    return {
      kycSubmissions: processedSubmissions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching KYC submissions:", error)
    return {
      kycSubmissions: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    }
  }
}

/**
 * Safely fetch users with proper error handling
 */
export async function fetchUsers(
  options: {
    status?: string
    role?: string
    page?: number
    limit?: number
    search?: string
  } = {},
) {
  try {
    await dbConnect()

    const { status, role, page = 1, limit = 10, search } = options
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (status && status !== "all") {
      query.status = status
    }

    if (role && role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Get total count
    const total = await User.countDocuments(query)

    // Get users with pagination
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    }
  }
}
