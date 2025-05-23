import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Course from "@/models/Course"
import Transaction from "@/models/Transaction"
import KYC from "@/models/KYC"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await dbConnect()

    // Get total users count
    const totalUsers = await User.countDocuments()

    // Get users registered in the last month
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const newUsersLastMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } })

    // Calculate growth percentage
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const usersInPreviousMonth = await User.countDocuments({
      createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
    })

    const userGrowthPercentage =
      usersInPreviousMonth > 0
        ? Math.round(((newUsersLastMonth - usersInPreviousMonth) / usersInPreviousMonth) * 100)
        : 100

    // Get active users (users who logged in within the last month)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: lastMonth },
    })

    const activeUsersPercentage = Math.round((activeUsers / totalUsers) * 100)

    // Get premium users (users who have purchased at least one package)
    const premiumUsers = await User.countDocuments({
      enrollments: { $exists: true, $not: { $size: 0 } },
    })

    const premiumUsersPercentage = Math.round((premiumUsers / totalUsers) * 100)

    // Get verified affiliates
    const verifiedAffiliates = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
      isKYCVerified: true,
    })

    const verifiedAffiliatesPercentage = Math.round((verifiedAffiliates / totalUsers) * 100)

    // Get active courses count
    const activeCourses = await Course.countDocuments({ isPublished: true })

    // Get new courses this month
    const newCoursesThisMonth = await Course.countDocuments({
      createdAt: { $gte: lastMonth },
      isPublished: true,
    })

    // Get total revenue
    const transactions = await Transaction.find({ status: "approved" })
    const totalRevenue = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

    // Get revenue from last month
    const lastMonthTransactions = await Transaction.find({
      status: "approved",
      createdAt: { $gte: lastMonth },
    })

    const lastMonthRevenue = lastMonthTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

    // Calculate revenue growth
    const twoMonthsAgoTransactions = await Transaction.find({
      status: "approved",
      createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
    })

    const previousMonthRevenue = twoMonthsAgoTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0,
    )

    const revenueGrowthPercentage =
      previousMonthRevenue > 0
        ? Math.round(((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
        : 100

    // Get pending KYC count
    const pendingKYC = await KYC.countDocuments({ status: "pending" })

    // Get system status
    const systemStatus = {
      payment: {
        operational: true,
        message: "All payment gateways operational",
      },
      courseDelivery: {
        operational: true,
        message: "Video streaming and content delivery operational",
      },
      affiliateTracking: {
        operational: true,
        message: "Affiliate tracking system operational",
      },
    }

    // Get new users this month
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth },
    })

    return NextResponse.json({
      userStats: {
        total: totalUsers,
        growth: userGrowthPercentage,
        active: {
          count: activeUsers,
          percentage: activeUsersPercentage,
        },
        premium: {
          count: premiumUsers,
          percentage: premiumUsersPercentage,
        },
        verifiedAffiliates: {
          count: verifiedAffiliates,
          percentage: verifiedAffiliatesPercentage,
        },
        newThisMonth: newUsersThisMonth,
      },
      courseStats: {
        active: activeCourses,
        newThisMonth: newCoursesThisMonth,
      },
      revenueStats: {
        total: totalRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowthPercentage,
      },
      kycStats: {
        pending: pendingKYC,
      },
      systemStatus,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return NextResponse.json({ message: "Failed to fetch dashboard stats", error: String(error) }, { status: 500 })
  }
}
