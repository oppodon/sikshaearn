import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"

export async function POST(request: NextRequest, { params }: { params: { courseid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      course: params.courseid,
    })

    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 })
    }

    // Update last accessed
    enrollment.lastAccessed = new Date()
    await enrollment.save()

    return NextResponse.json({
      success: true,
      message: "Last accessed time updated",
    })
  } catch (error) {
    console.error("Error updating last accessed time:", error)
    return NextResponse.json({ error: "Failed to update last accessed time" }, { status: 500 })
  }
}
