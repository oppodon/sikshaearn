import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Course from "@/models/Course"

export async function POST(request: NextRequest, { params }: { params: { slug: string; lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to mark lessons as complete" }, { status: 401 })
    }

    await connectToDatabase()

    // Get form data
    const formData = await request.formData()
    const courseId = formData.get("courseId") as string
    const lessonId = params.lessonId

    if (!courseId || !lessonId) {
      return NextResponse.json({ error: "Course ID and Lesson ID are required" }, { status: 400 })
    }

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      course: courseId,
    })

    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 })
    }

    // Add the lesson to completedLessons if not already there
    if (!enrollment.completedLessons) {
      enrollment.completedLessons = []
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
    }

    // Calculate progress
    const course = await Course.findById(courseId)
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    const progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100)

    enrollment.progress = progress
    enrollment.lastAccessed = new Date()
    enrollment.currentLesson = lessonId

    await enrollment.save()

    return NextResponse.json({
      success: true,
      completedLessons: enrollment.completedLessons,
      progress,
    })
  } catch (error) {
    console.error("Error marking lesson as complete:", error)
    return NextResponse.json({ error: "Failed to mark lesson as complete" }, { status: 500 })
  }
}
