import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Enrollment from "@/models/Enrollment"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = params.id

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get all enrollments for this user
    const enrollments = await Enrollment.find({ user: userId, isActive: true })
      .populate({
        path: "package",
        model: "Package",
        select: "title description price thumbnail duration level",
      })
      .populate({
        path: "transaction",
        model: "Transaction",
        select: "amount status paymentMethodId completedAt createdAt",
      })
      .sort({ createdAt: -1 })

    // Format the response
    const userPackages = enrollments.map((enrollment) => ({
      id: enrollment._id,
      package: enrollment.package,
      transaction: enrollment.transaction,
      startDate: enrollment.startDate,
      endDate: enrollment.endDate,
      progress: enrollment.progress,
      isActive: enrollment.isActive,
      coursesCount: enrollment.courses?.length || 0,
      completedCourses: enrollment.completedCourses?.length || 0,
      isAdminAssigned: enrollment.transaction?.paymentMethodId === "admin_assignment",
      lastAccessed: enrollment.lastAccessed,
    }))

    return NextResponse.json({
      packages: userPackages,
      totalPackages: userPackages.length,
    })
  } catch (error: any) {
    console.error("Error fetching user packages:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
