import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Contact from "@/models/Contact"
import { sendEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    })

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@sikshaearn.com",
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p>Submitted at: ${new Date().toLocaleString()}</p>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact message:", error)
    return NextResponse.json({ success: false, error: "Failed to send message. Please try again." }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let filter = {}
    if (status && status !== "all") {
      filter = { status }
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Contact.countDocuments(filter)

    return NextResponse.json({
      success: true,
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch contacts" }, { status: 500 })
  }
}
