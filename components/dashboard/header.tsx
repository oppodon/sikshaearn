"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Bell, Menu, Search, Sparkles, Sun, Moon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"

export function DashboardHeader() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const pathSegments = pathname.split("/").filter(Boolean)

  // Format the current path for breadcrumb
  const formattedPath =
    pathSegments.length > 1
      ? pathSegments[1]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Dashboard"

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-gradient-to-r from-white via-blue-50 to-indigo-50 backdrop-blur-lg border-blue-100/50 px-4 shadow-lg shadow-blue-100/20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden hover:bg-blue-100/50 transition-colors"
        >
          <Menu className="h-5 w-5 text-blue-600" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Siksha<span className="text-orange-500">Earn</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:block h-6 w-px bg-gradient-to-b from-blue-200 to-purple-200"></div>
        <h1 className="hidden md:block text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          {formattedPath}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur opacity-50"></div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
            <Input
              type="search"
              placeholder="Search courses, stats..."
              className="w-[280px] rounded-full bg-white/80 backdrop-blur-sm pl-9 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 focus-visible:bg-white transition-all"
            />
          </div>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative overflow-hidden group hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-600" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-600" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-md"></div>
          <Bell className="h-5 w-5 text-blue-600 group-hover:text-purple-600 transition-colors" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Avatar className="h-9 w-9 ring-2 ring-gradient-to-r ring-blue-200 group-hover:ring-blue-400 transition-all">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                  OP
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-lg border-blue-100" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      OP
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Om Poudel</p>
                    <p className="text-xs text-gray-500">om@sikshalearn.com</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full">
                    Pro Member
                  </span>
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full">
                    Level 5
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gradient-to-r from-blue-100 to-purple-100" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer group">
                <div className="flex items-center gap-2 w-full p-1">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="group-hover:text-blue-600 transition-colors">Profile Settings</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/my-courses" className="cursor-pointer group">
                <div className="flex items-center gap-2 w-full p-1">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span className="group-hover:text-green-600 transition-colors">My Learning</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/affiliate-dashboard" className="cursor-pointer group">
                <div className="flex items-center gap-2 w-full p-1">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <span className="group-hover:text-purple-600 transition-colors">Affiliate Hub</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/earnings" className="cursor-pointer group">
                <div className="flex items-center gap-2 w-full p-1">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                  <span className="group-hover:text-yellow-600 transition-colors">Earnings</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gradient-to-r from-blue-100 to-purple-100" />
            <DropdownMenuItem asChild>
              <Link href="/logout" className="cursor-pointer group">
                <div className="flex items-center gap-2 w-full p-1">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                  <span className="group-hover:text-red-600 transition-colors">Sign Out</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
