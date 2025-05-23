"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Home, BookOpen, Share2, CreditCard, BarChart2, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()

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
        {
          title: "Course Player",
          href: "/dashboard/courses",
          isActive: pathname.includes("/dashboard/courses/"),
        },
        {
          title: "Certificates",
          href: "/dashboard/certificates",
          isActive: pathname === "/dashboard/certificates",
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
        {
          title: "Marketing Material",
          href: "/dashboard/marketing-material",
          isActive: pathname === "/dashboard/marketing-material",
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
      ],
    },
    {
      title: "Analytics",
      icon: BarChart2,
      isActive: pathname.includes("/dashboard/traffic") || pathname.includes("/dashboard/conversions"),
      submenu: [
        {
          title: "Traffic",
          href: "/dashboard/traffic",
          isActive: pathname === "/dashboard/traffic",
        },
        {
          title: "Conversions",
          href: "/dashboard/conversions",
          isActive: pathname === "/dashboard/conversions",
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
        {
          title: "Plan",
          href: "/dashboard/plan",
          isActive: pathname === "/dashboard/plan",
        },
        {
          title: "Qualification",
          href: "/dashboard/qualification",
          isActive: pathname === "/dashboard/qualification",
        },
        {
          title: "Social Media Handles",
          href: "/dashboard/social-media",
          isActive: pathname === "/dashboard/social-media",
        },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Knowledge Hub Nepal Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-medium text-blue-600">Knowledge Hub Nepal</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {!item.submenu ? (
                <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <>
                  <SidebarMenuButton isActive={item.isActive} tooltip={item.title}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {item.submenu.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <Link href={subItem.href}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="text-sm text-muted-foreground">
          <span>© 2024 Knowledge Hub Nepal</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
