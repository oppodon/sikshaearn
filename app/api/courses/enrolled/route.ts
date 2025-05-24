import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Transaction, Enrollment } from "@/lib/models"

export async function GET() {
  try {
    console.log("=== FETCHING ENROLLED COURSES ===")

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("User ID:", userId)

    await connectToDatabase()

    // Ensure all models are registered
    ensureModelsRegistered()

    // Get all completed transactions for this user
    const transactions = await Transaction.find({
      user: userId,
      status: "completed",
    })
      .populate("package")
      .lean()

    console.log(`Found ${transactions.length} completed transactions`)

    if (transactions.length === 0) {
      return NextResponse.json({
        success: true,
        courses: [],
        message: "No completed transactions found",
      })
    }

    // Get all enrollments for this user
    const enrollments = await Enrollment.find({
      user: userId,
      isActive: true,
    })
      .populate({
        path: "courses",
        model: "Course",
      })
      .populate("package")
      .lean()

    console.log(`Found ${enrollments.length} active enrollments`)

    // Extract courses from enrollments
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
              _id: course._id,
              title: course.title,
              slug: course.slug,
              description: course.description,
              thumbnail: course.thumbnail,
              instructor: course.instructor,
              level: course.level,
              duration: course.duration,
              videoLessons: course.videoLessons || [],

              // Package info
              packageId: enrollment.package?._id,
              packageTitle: enrollment.package?.title,

              // Enrollment info
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
      courses: courses,
      stats: {
        totalTransactions: transactions.length,
        totalEnrollments: enrollments.length,
        totalCourses: courses.length,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching enrolled courses:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enrolled courses",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
