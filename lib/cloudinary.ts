import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
})

export default cloudinary

export async function uploadImage(file: File | Buffer | ArrayBuffer, folder = "uploads") {
  try {
    let buffer: Buffer

    // Handle different input types
    if (file instanceof File) {
      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else if (file instanceof ArrayBuffer) {
      buffer = Buffer.from(file)
    } else if (Buffer.isBuffer(file)) {
      buffer = file
    } else {
      throw new Error("Unsupported file type")
    }

    // Convert buffer to base64
    const base64 = buffer.toString("base64")
    const dataURI = `data:image/jpeg;base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `knowledgehubnepal/${folder}`,
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error: any) {
    console.error("Cloudinary upload error:", error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

// Export the uploadToCloudinary function that's being imported in transactions
export async function uploadToCloudinary(buffer: ArrayBuffer, path: string, mimeType: string) {
  try {
    // Convert ArrayBuffer to Buffer
    const fileBuffer = Buffer.from(buffer)

    // Convert buffer to base64
    const base64 = fileBuffer.toString("base64")
    const dataURI = `data:${mimeType};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `knowledgehubnepal/${path.split("/")[0]}`, // Extract folder name from path
      resource_type: "auto",
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error: any) {
    console.error("Cloudinary upload error:", error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error: any) {
    console.error("Cloudinary delete error:", error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
