"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Home,
  Users,
  Package,
  BookOpen,
  ShieldCheck,
  Share2,
  CreditCard,
  FileText,
  BarChart2,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  submenu?: {
    title: string
    href: string
  }[]
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const { data: session } = useSession()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    packages: false,
    courses: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Packages",
      icon: Package,
      submenu: [
        { title: "All Packages", href: "/admin/packages" },
        { title: "Create Package", href: "/admin/packages/create" },
      ],
    },
    {
      title: "Courses",
      icon: BookOpen,
      submenu: [
        { title: "All Courses", href: "/admin/courses" },
        { title: "Create Course", href: "/admin/courses/create" },
      ],
    },
    {
      title: "KYC",
      href: "/admin/kyc",
      icon: ShieldCheck,
    },
    {
      title: "Affiliates",
      href: "/admin/affiliates",
      icon: Share2,
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart2,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const NavItems = () => (
    <div className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.href ? pathname === item.href : item.submenu?.some((sub) => pathname === sub.href)

        if (!item.submenu) {
          return (
            <Link
              key={item.title}
              href={item.href || "#"}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50",
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        }

        const sectionKey = item.title.toLowerCase()
        const isOpen = openSections[sectionKey]

        return (
          <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50",
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-8 pt-1">
              {item.submenu?.map((subItem) => (
                <Link
                  key={subItem.title}
                  href={subItem.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50",
                    pathname === subItem.href
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400",
                  )}
                >
                  {subItem.title}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-lg font-semibold">Admin Panel</span>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <NavItems />
            </ScrollArea>

            {/* User Profile */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session?.user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{session?.user?.name || "Admin"}</p>
                  <p className="truncate text-xs text-gray-500">{session?.user?.email || "admin@example.com"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-white dark:bg-gray-950 lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <NavItems />
          </ScrollArea>

          {/* User Profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {session?.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{session?.user?.name || "Admin"}</p>
                <p className="truncate text-xs text-gray-500">{session?.user?.email || "admin@example.com"}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="h-8 w-8 text-gray-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
