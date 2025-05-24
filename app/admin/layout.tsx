import type { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AdminSidebarProvider, AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AdminSidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
            <AdminHeader />
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
        <Toaster />
      </AdminSidebarProvider>
    </ThemeProvider>
  )
}
