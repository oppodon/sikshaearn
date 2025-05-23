"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Home,
  BookOpen,
  Share2,
  CreditCard,
  BarChart2,
  User,
  ChevronDown,
  Award,
  LinkIcon,
  Users,
  Trophy,
  Megaphone,
  Wallet,
  FileText,
  TrendingUp,
  BarChart,
  FileCheck,
  Settings,
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  submenu?: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const { isOpen, setIsOpen } = useSidebar()

  // Initialize open state based on active path
  useEffect(() => {
    const newOpenGroups: Record<string, boolean> = {}

    navItems.forEach((item) => {
      if (item.submenu) {
        const isActive = item.submenu.some((subItem) => pathname === subItem.href)
        if (isActive) {
          newOpenGroups[item.title] = true
        }
      }
    })

    setOpenGroups(newOpenGroups)
  }, [pathname])

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Learning",
      icon: BookOpen,
      submenu: [
        {
          title: "My Courses",
          href: "/dashboard/my-courses",
          icon: BookOpen,
        },
        {
          title: "Course Player",
          href: "/dashboard/courses",
          icon: BookOpen,
        },
        {
          title: "Certificates",
          href: "/dashboard/certificates",
          icon: Award,
        },
      ],
    },
    {
      title: "Affiliate",
      icon: Share2,
      submenu: [
        {
          title: "Affiliate Dashboard",
          href: "/dashboard/affiliate-dashboard",
          icon: BarChart2,
        },
        {
          title: "Affiliate Link",
          href: "/dashboard/affiliate-link",
          icon: LinkIcon,
        },
        {
          title: "My Affiliates",
          href: "/dashboard/my-affiliates",
          icon: Users,
        },
        {
          title: "Leaderboard",
          href: "/dashboard/leaderboard",
          icon: Trophy,
        },
        {
          title: "Marketing Material",
          href: "/dashboard/marketing-material",
          icon: Megaphone,
        },
      ],
    },
    {
      title: "Finance",
      icon: CreditCard,
      submenu: [
        {
          title: "Payouts",
          href: "/dashboard/payouts",
          icon: Wallet,
        },
        {
          title: "Withdrawal Request",
          href: "/dashboard/withdrawal",
          icon: FileText,
        },
      ],
    },
    {
      title: "Analytics",
      icon: BarChart2,
      submenu: [
        {
          title: "Traffic",
          href: "/dashboard/traffic",
          icon: TrendingUp,
        },
        {
          title: "Conversions",
          href: "/dashboard/conversions",
          icon: BarChart,
        },
      ],
    },
    {
      title: "Account",
      icon: User,
      submenu: [
        {
          title: "Profile",
          href: "/dashboard/profile",
          icon: User,
        },
        {
          title: "KYC",
          href: "/dashboard/kyc",
          icon: FileCheck,
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ]

  const NavItems = () => (
    <>
      {navItems.map((item) => (
        <div key={item.title} className="mb-1">
          {!item.submenu ? (
            <Link
              href={item.href || "#"}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700 dark:text-gray-300",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          ) : (
            <>
              <button
                onClick={() => toggleGroup(item.title)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
                  item.submenu.some((subItem) => pathname === subItem.href)
                    ? "text-primary"
                    : "text-gray-700 dark:text-gray-300",
                )}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", openGroups[item.title] ? "rotate-180" : "")}
                />
              </button>
              {openGroups[item.title] && (
                <div className="mt-1 space-y-1 pl-10">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary",
                        pathname === subItem.href ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-400",
                      )}
                    >
                      <subItem.icon className="mr-3 h-4 w-4" />
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </>
  )

  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex h-14 items-center border-b px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                  <span className="text-lg font-bold text-white">K</span>
                </div>
                <span className="font-semibold text-lg">Knowledge Hub</span>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-3.5rem)]">
              <div className="px-2 py-4">
                <NavItems />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fixed position */}
      <div className="fixed hidden lg:block top-0 left-0 bottom-0 w-64 border-r bg-white dark:bg-gray-950 dark:border-gray-800 z-30">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-lg font-bold text-white">K</span>
            </div>
            <span className="font-semibold text-lg">Knowledge Hub</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <div className="px-2 py-4">
            <NavItems />
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
