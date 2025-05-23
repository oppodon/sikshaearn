import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Course from "@/models/Course"
import Package from "@/models/Package"

export async function POST(request: NextRequest, { params }: { params: { courseid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 })
    }

    await connectToDatabase()
    const { courseid } = params

    // Find course by ID
    const course = await Course.findById(courseid).lean()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Find packages that contain this course
    const packages = await Package.find({
      courses: { $in: [courseid] },
    })
      .select("_id")
      .lean()

    if (!packages || packages.length === 0) {
      return NextResponse.json({ error: "Course not available in any package" }, { status: 404 })
    }

    const packageIds = packages.map((pkg) => pkg._id)

    // Find user's enrollment for this course
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      package: { $in: packageIds },
      isActive: true,
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Check if the lesson exists in the course
    const lessonExists = course.videoLessons.some((lesson) => lesson._id.toString() === lessonId)

    if (!lessonExists) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 })
    }

    // Add lesson to completed lessons if not already completed
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
    }

    // Update current lesson
    enrollment.currentLesson = lessonId

    // Calculate progress
    const totalLessons = course.videoLessons.length
    const completedLessonsInCourse = enrollment.completedLessons.filter((id) =>
      course.videoLessons.some((lesson) => lesson._id.toString() === id.toString()),
    ).length

    enrollment.progress = Math.round((completedLessonsInCourse / totalLessons) * 100)

    // Check if all lessons are completed
    if (enrollment.progress === 100) {
      // Add course to completed courses if not already there
      if (!enrollment.completedCourses.includes(courseid)) {
        enrollment.completedCourses.push(courseid)
      }
    }

    // Update last accessed
    enrollment.lastAccessed = new Date()

    await enrollment.save()

    return NextResponse.json({
      success: true,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    })
  } catch (error: any) {
    console.error("Error completing lesson:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
