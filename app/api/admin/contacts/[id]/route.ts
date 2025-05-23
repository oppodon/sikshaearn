import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Contact from "@/models/Contact"
import { sendEmail } from "@/lib/mail"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { status, reply } = await req.json()
    const contactId = params.id

    const updateData: any = { status }

    if (reply && status === "replied") {
      updateData.reply = reply
      updateData.repliedAt = new Date()
      updateData.repliedBy = session.user.id
    }

    const contact = await Contact.findByIdAndUpdate(contactId, updateData, { new: true })

    if (!contact) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    // Send reply email to user if replying
    if (reply && status === "replied") {
      try {
        await sendEmail({
          to: contact.email,
          subject: `Re: ${contact.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Reply from SikshaEarn Support</h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">Your Original Message:</h3>
                <p><strong>Subject:</strong> ${contact.subject}</p>
                <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #e5e7eb;">
                  ${contact.message.replace(/\n/g, "<br>")}
                </p>
              </div>

              <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="margin-top: 0; color: #1e40af;">Our Reply:</h3>
                <p style="color: #374151; line-height: 1.6;">
                  ${reply.replace(/\n/g, "<br>")}
                </p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p>If you have any further questions, please don't hesitate to contact us.</p>
                <p>
                  Best regards,<br>
                  <strong>SikshaEarn Support Team</strong><br>
                  Email: support@sikshaearn.com<br>
                  Website: <a href="http://localhost:3000" style="color: #2563eb;">SikshaEarn</a>
                </p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Failed to send reply email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json({ success: false, error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const contact = await Contact.findByIdAndDelete(params.id)

    if (!contact) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Contact deleted successfully" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ success: false, error: "Failed to delete contact" }, { status: 500 })
  }
}
