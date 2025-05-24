import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Transaction, Enrollment } from "@/lib/models"

export async function GET() {
  try {
    console.log("=== FETCHING USER COURSES ===")

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("User ID:", userId)

    await connectToDatabase()

    // Ensure all models are registered
    ensureModelsRegistered()

    // Get completed transactions
    const transactions = await Transaction.find({
      user: userId,
      status: "completed",
    }).lean()

    console.log(`Found ${transactions.length} completed transactions`)

    // Get active enrollments
    const enrollments = await Enrollment.find({
      user: userId,
      isActive: true,
    })
      .populate({
        path: "courses",
        model: "Course",
      })
      .populate("package", "title")
      .lean()

    console.log(`Found ${enrollments.length} active enrollments`)

    const courses = []

    for (const enrollment of enrollments) {
      if (enrollment.courses && Array.isArray(enrollment.courses)) {
        for (const course of enrollment.courses) {
          if (course && course._id) {
            // Calculate progress
            const totalLessons = course.videoLessons?.length || 10
            const completedLessons = enrollment.completedLessons || []
            const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

            courses.push({
              ...course,
              packageTitle: enrollment.package?.title || "Unknown Package",
              packageId: enrollment.package?._id,
              enrollmentId: enrollment._id,
              progress: progress,
              completedLessons: completedLessons,
              enrolledAt: enrollment.startDate || enrollment.createdAt,
              lastAccessed: enrollment.lastAccessed,
              status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
            })
          }
        }
      }
    }

    console.log(`Returning ${courses.length} courses`)

    return NextResponse.json({
      success: true,
      courses,
      enrollments,
      transactions,
      stats: {
        totalPackages: new Set(enrollments.map((e) => e.package?._id?.toString())).size,
        totalCourses: courses.length,
        inProgressCourses: courses.filter((c) => c.status === "in-progress").length,
        completedCourses: courses.filter((c) => c.status === "completed").length,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching user courses:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user courses",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
