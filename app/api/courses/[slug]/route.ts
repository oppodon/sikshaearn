import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    // Await params in Next.js 15
    const { slug } = await params

    const course = await Course.findOne({ slug }).lean()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    // Await params in Next.js 15
    const { slug } = await params
    const data = await req.json()
    console.log("Updating course with data:", data)

    const course = await Course.findOne({ slug })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Process instructor data
    if (data.instructor && typeof data.instructor === "object") {
      if (!data.instructor.name) {
        // If instructor is an object but name is empty, use a default string
        data.instructor = "Instructor"
      }
    }

    // Process video lessons
    if (data.videoLessons) {
      data.videoLessons.forEach((lesson: any) => {
        // Ensure videoUrl is a string
        if (!lesson.videoUrl) {
          lesson.videoUrl = ""
        }
      })
    }

    // Update course fields
    Object.keys(data).forEach((key) => {
      course[key] = data[key]
    })

    await course.save()

    return NextResponse.json({ course })
  } catch (error: any) {
    console.error("Error updating course:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    // Await params in Next.js 15
    const { slug } = await params

    const result = await Course.deleteOne({ slug })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
