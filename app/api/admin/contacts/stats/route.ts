import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Contact from "@/models/Contact"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const [totalContacts, unreadContacts, repliedContacts, archivedContacts, todayContacts] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: "unread" }),
      Contact.countDocuments({ status: "replied" }),
      Contact.countDocuments({ status: "archived" }),
      Contact.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ])

    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject status createdAt")
      .lean()

    return NextResponse.json({
      success: true,
      stats: {
        total: totalContacts,
        unread: unreadContacts,
        replied: repliedContacts,
        archived: archivedContacts,
        today: todayContacts,
      },
      recentContacts,
    })
  } catch (error) {
    console.error("Error fetching contact stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch contact stats" }, { status: 500 })
  }
}
