import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { action } = await request.json() // Declare the action variable here

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!["ban", "unban"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    await dbConnect()

    const userId = params.id

    // Prevent admin from banning themselves
    if (userId === session.user.id) {
      return NextResponse.json({ message: "Cannot ban yourself" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update user status
    const newStatus = action === "ban" ? "banned" : "active"
    await User.findByIdAndUpdate(userId, { status: newStatus })

    return NextResponse.json({
      message: `User ${action === "ban" ? "banned" : "unbanned"} successfully`,
      status: newStatus,
    })
  } catch (error) {
    console.error(`Error ${action}ning user:`, error) // Use the action variable here
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
