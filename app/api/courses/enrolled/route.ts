import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    console.log("API: /api/courses/enrolled - Starting request")
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.log("API: /api/courses/enrolled - Unauthorized request")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`API: /api/courses/enrolled - Fetching courses for user: ${userId}`)

    await connectToDatabase()
    console.log("API: /api/courses/enrolled - Connected to database")

    // Import models directly to ensure they're registered
    require("@/models/Package")
    require("@/models/Course")
    require("@/models/Enrollment")
    require("@/models/Transaction")

    // Step 1: Get all approved transactions for this user
    const transactions = await mongoose
      .model("Transaction")
      .find({
        user: userId,
        status: "approved",
      })
      .lean()

    console.log(`API: /api/courses/enrolled - Found ${transactions.length} approved transactions`)

    if (transactions.length === 0) {
      return NextResponse.json({
        success: true,
        courses: [],
        message: "No approved transactions found",
      })
    }

    // Step 2: Get package IDs from transactions
    const packageIds = transactions.map((t) => t.package)

    // Step 3: Get packages with their courses
    const packages = await mongoose
      .model("Package")
      .find({
        _id: { $in: packageIds },
      })
      .populate("courses")
      .lean()

    console.log(`API: /api/courses/enrolled - Found ${packages.length} packages`)

    // Step 4: Get enrollments for this user
    const enrollments = await mongoose
      .model("Enrollment")
      .find({
        user: userId,
        isActive: true,
      })
      .lean()

    console.log(`API: /api/courses/enrolled - Found ${enrollments.length} enrollments`)

    // Step 5: Extract all courses from packages
    const allCourses = []

    for (const pkg of packages) {
      console.log(`Processing package: ${pkg.title || pkg.name}, courses: ${pkg.courses?.length || 0}`)

      if (!pkg.courses || !Array.isArray(pkg.courses) || pkg.courses.length === 0) {
        console.log(`No courses found in package ${pkg._id}`)
        continue
      }

      // Find enrollment for this package
      const enrollment = enrollments.find((e) => e.package && e.package.toString() === pkg._id.toString())

      // If no enrollment exists for this package, create one
      if (!enrollment && transactions.some((t) => t.package.toString() === pkg._id.toString())) {
        console.log(`No enrollment found for package ${pkg._id}, but transaction exists`)
        // We'll still show the courses, but mark them as needing enrollment
      }

      for (const course of pkg.courses) {
        if (!course) {
          console.log("Skipping undefined course")
          continue
        }

        // Calculate progress if there's an enrollment
        let progress = 0
        let completedLessons = []

        if (enrollment) {
          completedLessons = enrollment.completedLessons || []
          const totalLessons = course.videoLessons?.length || 10

          if (totalLessons > 0 && completedLessons.length > 0) {
            const completedForThisCourse = completedLessons.filter(
              (l) => l.course && l.course.toString() === course._id.toString(),
            ).length

            progress = Math.round((completedForThisCourse / totalLessons) * 100)
          }
        }

        // Find transaction for this package
        const transaction = transactions.find((t) => t.package && t.package.toString() === pkg._id.toString())

        allCourses.push({
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
          packageId: pkg._id,
          packageTitle: pkg.title || pkg.name,

          // Enrollment info
          enrollmentId: enrollment?._id,
          progress: progress,
          completedLessons: completedLessons,
          enrolledAt: enrollment?.startDate || enrollment?.createdAt || transaction?.createdAt,
          lastAccessed: enrollment?.lastAccessed,
          status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",

          // Transaction info
          transactionId: transaction?._id,
          purchaseDate: transaction?.createdAt,
          paymentMethod: transaction?.paymentMethod,
        })
      }
    }

    console.log(`API: /api/courses/enrolled - Returning ${allCourses.length} courses`)
    return NextResponse.json({
      success: true,
      courses: allCourses,
      stats: {
        totalEnrollments: enrollments.length,
        totalPackages: packages.length,
        totalCourses: allCourses.length,
        completedTransactions: transactions.length,
      },
    })
  } catch (error) {
    console.error("API: /api/courses/enrolled - Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enrolled courses",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
