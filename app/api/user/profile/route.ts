import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// GET /api/user/profile - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = session.user.id
    const body = await req.json()
    const { name, email, bio, country, city, phone, username } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is being changed and if it's already in use
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
      }
    }

    // Check if username is being changed and if it's already in use
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } })
      if (existingUser) {
        return NextResponse.json({ error: "Username is already in use" }, { status: 400 })
      }
    }

    // Update user fields
    user.name = name
    user.email = email
    if (bio !== undefined) user.bio = bio
    if (country !== undefined) user.country = country
    if (city !== undefined) user.city = city
    if (phone !== undefined) user.phone = phone
    if (username !== undefined) user.username = username

    await user.save()

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        country: user.country,
        city: user.city,
        phone: user.phone,
        username: user.username,
        image: user.image,
      },
    })
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
