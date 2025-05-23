import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Transaction from "@/models/Transaction"
import Package from "@/models/Package"
import Course from "@/models/Course"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get user transactions
    const transactions = await Transaction.find({ user: session.user.id }).lean()
    const completedTransactions = transactions.filter((t) => t.status === "completed")
    const approvedTransactions = transactions.filter((t) => t.status === "approved")

    // Get user enrollments
    const enrollments = await Enrollment.find({ user: session.user.id }).lean()

    // Get packages from enrollments
    const packageIds = enrollments.map((e) => e.package)
    const packages = await Package.find({ _id: { $in: packageIds } }).lean()

    // Get all course IDs from packages
    const allCourseIds = []
    packages.forEach((pkg) => {
      if (pkg.courses && pkg.courses.length > 0) {
        allCourseIds.push(...pkg.courses)
      }
    })

    // Get courses
    const courses = await Course.find({ _id: { $in: allCourseIds } }).lean()

    return NextResponse.json({
      userId: session.user.id,
      transactions: {
        total: transactions.length,
        completed: completedTransactions.length,
        approved: approvedTransactions.length,
        pending: transactions.filter((t) => t.status === "pending").length,
        rejected: transactions.filter((t) => t.status === "rejected").length,
        details: transactions.map((t) => ({
          id: t._id,
          status: t.status,
          amount: t.amount,
          package: t.package,
          createdAt: t.createdAt,
        })),
      },
      enrollments: {
        total: enrollments.length,
        details: enrollments.map((e) => ({
          id: e._id,
          package: e.package,
          isActive: e.isActive,
          transaction: e.transaction,
        })),
      },
      packages: {
        total: packages.length,
        details: packages.map((p) => ({
          id: p._id,
          title: p.title,
          name: p.name,
          coursesCount: p.courses?.length || 0,
          courses: p.courses || [],
        })),
      },
      courses: {
        total: courses.length,
        details: courses.map((c) => ({
          id: c._id,
          title: c.title,
          slug: c.slug,
        })),
      },
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
