"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Home, BookOpen, Share2, CreditCard, User, Menu } from 'lucide-react'
import { useState, createContext, useContext } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Create sidebar context
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    },
    {
      title: "Learning",
      icon: BookOpen,
      isActive: pathname.includes("/dashboard/my-courses") || pathname.includes("/dashboard/courses"),
      submenu: [
        {
          title: "My Courses",
          href: "/dashboard/my-courses",
          isActive: pathname === "/dashboard/my-courses",
        },
       
      ],
    },
    {
      title: "Affiliate",
      icon: Share2,
      isActive: pathname.includes("/dashboard/affiliate"),
      submenu: [
        {
          title: "Affiliate Dashboard",
          href: "/dashboard/affiliate-dashboard",
          isActive: pathname === "/dashboard/affiliate-dashboard",
        },
        {
          title: "Affiliate Link",
          href: "/dashboard/affiliate-link",
          isActive: pathname === "/dashboard/affiliate-link",
        },
        {
          title: "My Affiliates",
          href: "/dashboard/my-affiliates",
          isActive: pathname === "/dashboard/my-affiliates",
        },
        {
          title: "Leaderboard",
          href: "/dashboard/leaderboard",
          isActive: pathname === "/dashboard/leaderboard",
        },
  
      ],
    },
    {
      title: "Finance",
      icon: CreditCard,
      isActive: pathname.includes("/dashboard/payouts") || pathname.includes("/dashboard/withdrawal"),
      submenu: [
        {
          title: "Payouts",
          href: "/dashboard/payouts",
          isActive: pathname === "/dashboard/payouts",
        },
        {
          title: "Withdrawal Request",
          href: "/dashboard/withdrawal",
          isActive: pathname === "/dashboard/withdrawal",
        },
        {
          title: "Earnings",
          href: "/dashboard/earnings",
          isActive: pathname === "/dashboard/earnings",
        },
        {
          title: "Purchase Request",
          href: "/dashboard/transactions",
          isActive: pathname === "/dashboard/transactions",
        },
      ],
    },
    {
      title: "Account",
      icon: User,
      isActive: pathname.includes("/dashboard/profile") || pathname.includes("/dashboard/kyc"),
      submenu: [
        {
          title: "Profile",
          href: "/dashboard/profile",
          isActive: pathname === "/dashboard/profile",
        },
        {
          title: "KYC",
          href: "/dashboard/kyc",
          isActive: pathname === "/dashboard/kyc",
        },
       
      ],
    },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b p-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="relative h-8 w-8">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Siksha Earn Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-medium text-blue-600">Siksha Earn</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              {!item.submenu ? (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    item.isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ) : (
                <div className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      item.isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  <div className="ml-8 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          subItem.isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>© 2024 Siksha Earn</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}