import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// PATCH /api/admin/users/[id]/role - Update user role
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = params.id
    const body = await req.json()
    const { role } = body

    // Validate role
    if (!role || !["user", "instructor", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    // Prevent changing your own role
    if (userId === session.user.id) {
      return NextResponse.json({ message: "You cannot change your own role" }, { status: 400 })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update user role
    user.role = role
    await user.save()

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
