import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with explicit environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Log environment variables (without exposing secrets)
    console.log("Cloudinary config check:", {
      cloud_name_set: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key_set: !!process.env.CLOUDINARY_API_KEY,
      api_secret_set: !!process.env.CLOUDINARY_API_SECRET,
    })

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert buffer to base64
    const base64 = buffer.toString("base64")
    const fileType = file.type.split("/")[1]
    const dataURI = `data:${file.type};base64,${base64}`

    // Use a fallback for testing if Cloudinary credentials are missing
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("Cloudinary credentials missing, using fallback URL")
      // Return a placeholder URL for testing
      return NextResponse.json({
        url: `/placeholder.svg?height=720&width=1280&text=Image+Upload`,
        publicId: "placeholder",
        width: 1280,
        height: 720,
      })
    }

    // Upload to Cloudinary without any cropping transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `knowledgehubnepal/${folder}`,
      resource_type: "image",
      format: fileType,
      // Remove all transformations that could cause cropping
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 })
  }
}
