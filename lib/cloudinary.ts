import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
})

export default cloudinary

export async function uploadImage(file: File, folder = "general") {
  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert buffer to base64
    const base64 = buffer.toString("base64")
    const fileType = file.type.split("/")[1]
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `knowledgehubnepal/${folder}`,
      resource_type: "image",
      format: fileType,
      transformation: [{ width: 1280, height: 720, crop: "limit" }, { quality: "auto:good" }, { fetch_format: "auto" }],
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

// Add the uploadToCloudinary function that's being imported in transactions
export async function uploadToCloudinary(buffer: ArrayBuffer, path: string, mimeType: string) {
  try {
    // Convert ArrayBuffer to Buffer
    const fileBuffer = Buffer.from(buffer)

    // Convert buffer to base64
    const base64 = fileBuffer.toString("base64")
    const dataURI = `data:${mimeType};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `knowledgehubnepal/${path.split("/")[0]}`,
      resource_type: "auto",
      public_id: path,
      transformation: [{ width: 1280, height: 720, crop: "limit" }, { quality: "auto:good" }, { fetch_format: "auto" }],
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}
