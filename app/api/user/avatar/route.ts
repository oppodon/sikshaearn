import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { uploadImage } from "@/lib/cloudinary"

// POST /api/user/avatar - Upload user avatar
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = session.user.id
    const formData = await req.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Cloudinary
    const result = await uploadImage(buffer, {
      folder: "user-avatars",
      public_id: `user-${userId}`,
      overwrite: true,
    })

    // Update user's image URL
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.image = result.secure_url
    await user.save()

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      imageUrl: result.secure_url,
    })
  } catch (error: any) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
