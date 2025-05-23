import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET all lessons for a course
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()

    const { slug } = params
    const course = await Course.findOne({ slug }).select("lessons")

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ lessons: course.lessons })
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

// POST add a new lesson to a course
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { slug } = params
    const lessonData = await req.json()

    const course = await Course.findOne({ slug })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Validate required fields
    const requiredFields = ["title", "description", "videoUrl", "duration"]
    for (const field of requiredFields) {
      if (!lessonData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Set the order to be the next in sequence
    lessonData.order = course.lessons.length + 1

    // Add the lesson to the course
    course.lessons.push(lessonData)
    await course.save()

    return NextResponse.json({ message: "Lesson added successfully", lesson: lessonData }, { status: 201 })
  } catch (error) {
    console.error("Error adding lesson:", error)
    return NextResponse.json({ error: "Failed to add lesson" }, { status: 500 })
  }
}
