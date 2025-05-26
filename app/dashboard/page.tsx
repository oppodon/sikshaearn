"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Clock,
  Play,
  ChevronRight,
  Users,
  Package,
  TrendingUp,
  Trophy,
  Crown,
  Rocket,
  Activity,
  BarChart3,
  CheckCircle2,
  Shield,
  Calendar,
  Star,
  Coins,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

// Counter Animation Hook
function useCounter(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (end === 0) {
      setCount(0)
      return
    }

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(start + (end - start) * easeOutQuart))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, start])

  return count
}

// Modern animated background with network pattern
function ModernAnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Network pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="currentColor" />
              <line x1="50" y1="50" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network)" />
        </svg>
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
  )
}

// Modern Profile Header Card
function ModernProfileHeader({ user }: { user: any }) {
  const [memberSince, setMemberSince] = useState("Jan 2024")

  useEffect(() => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt)
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      setMemberSince(monthYear)
    }
  }, [user])

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl h-40">
      {/* Network pattern background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-header" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="currentColor" />
              <line x1="30" y1="30" x2="60" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
              <line x1="30" y1="30" x2="60" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
              <line x1="30" y1="30" x2="0" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-header)" />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-lg"></div>
              <Avatar className="h-16 w-16 border-4 border-white/30 shadow-2xl relative z-10">
                <AvatarImage src={user?.image || "/placeholder.svg?height=64&width=64"} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{user?.name || "User"}</h1>
              <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 px-3 py-1 text-xs font-semibold shadow-lg">
                <Crown className="h-3 w-3 mr-1" />
                Pro Package
              </Badge>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/80 text-xs">Member Since</p>
              <p className="text-white font-semibold text-sm">{memberSince}</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Status</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-white font-semibold text-sm">Active</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Modern Compact Earnings Card with Counter
function ModernEarningsCard({
  title,
  amount,
  icon,
  gradient,
  delay = 0,
  trend = "+12%",
  trendUp = true,
}: {
  title: string
  amount: number
  icon: React.ReactNode
  gradient: string
  delay?: number
  trend?: string
  trendUp?: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const animatedAmount = useCounter(isVisible ? amount : 0, 2000)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Card
      className={`group relative overflow-hidden border-0 bg-gradient-to-br ${gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer h-32 ${
        isVisible ? "animate-fade-in-up" : "opacity-0"
      }`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-700"></div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-ping"
            style={{
              left: `${20 + i * 25}%`,
              top: `${30 + i * 15}%`,
              animationDelay: `${i * 300}ms`,
            }}
          />
        ))}
      </div>

      <CardContent className="p-4 relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
            <div className="text-white transform transition-transform duration-300 text-sm">{icon}</div>
          </div>
          <div className="flex items-center gap-1 text-white/90 text-xs">
            {trendUp ? <ArrowUp className="h-3 w-3 text-green-300" /> : <ArrowDown className="h-3 w-3 text-red-300" />}
            <span className={trendUp ? "text-green-300" : "text-red-300"}>{trend}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-white/90 text-xs font-medium">{title}</p>
          <div className="flex items-center gap-1">
            <span className="text-white/80 text-sm">₹</span>
            <span className="text-xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
              {animatedAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white/60 to-white/80 rounded-full transition-all duration-1000 ease-out"
            style={{ width: isVisible ? "75%" : "0%" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Modern Course Card
function ModernCourseCard({ course }: { course: any }) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusBadge = () => {
    if (course.progress === 100) {
      return (
        <Badge className="absolute right-3 top-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg animate-pulse">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (course.progress > 0) {
      return (
        <Badge className="absolute right-3 top-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg animate-pulse">
          <Activity className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    } else {
      return (
        <Badge className="absolute right-3 top-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <Star className="h-3 w-3 mr-1" />
          New
        </Badge>
      )
    }
  }

  return (
    <Card
      className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

      <div className="relative bg-gradient-to-br from-white to-gray-50 m-0.5 rounded-lg overflow-hidden">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {getStatusBadge()}

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
              style={{ width: `${isHovered ? course.progress || 0 : 0}%` }}
            />
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 line-clamp-2 text-lg group-hover:text-blue-700 transition-colors duration-300">
              {course.title}
            </h3>

            {course.packageName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <Package className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-700 font-semibold">{course.packageName}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700 font-semibold">2h 30m</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span className="text-green-700 font-semibold">24 lessons</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="text-gray-900 font-bold">{course.progress}%</span>
              </div>
              <div className="relative">
                <Progress value={course.progress || 0} className="h-3 bg-gray-100" />
                <div
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${isHovered ? course.progress || 0 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href={`/course/${course._id}`}>
              <Rocket className="mr-2 h-4 w-4" />
              {course.progress === 0
                ? "Start Learning"
                : course.progress === 100
                  ? "Review Course"
                  : "Continue Learning"}
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}

// Loading skeleton
function ModernLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header skeleton */}
      <div className="h-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse"></div>

      {/* Earnings cards skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse"
          ></div>
        ))}
      </div>

      {/* Courses skeleton */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-video bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main dashboard component
export default function ModernDashboardPage() {
  const { data: session, status } = useSession()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [userStats, setUserStats] = useState({
    todayEarning: 0,
    last7DaysEarning: 0,
    last30DaysEarning: 0,
    allTimeEarning: 0,
    pendingEarning: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserStats()
      fetchEnrolledCourses()
    }
  }, [status])

  const fetchUserStats = async () => {
    try {
      // Fetch affiliate stats
      const affiliateResponse = await fetch("/api/affiliate/stats")
      if (affiliateResponse.ok) {
        const affiliateData = await affiliateResponse.json()

        // Fetch balance transactions for earnings breakdown
        const transactionsResponse = await fetch("/api/user/balance/transactions")
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json()

          // Calculate earnings by time period
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

          const todayEarning =
            transactionsData.transactions
              ?.filter((tx: any) => new Date(tx.createdAt) >= today && tx.type === "credit")
              ?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0

          const last7DaysEarning =
            transactionsData.transactions
              ?.filter((tx: any) => new Date(tx.createdAt) >= last7Days && tx.type === "credit")
              ?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0

          const last30DaysEarning =
            transactionsData.transactions
              ?.filter((tx: any) => new Date(tx.createdAt) >= last30Days && tx.type === "credit")
              ?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0

          setUserStats({
            todayEarning,
            last7DaysEarning,
            last30DaysEarning,
            allTimeEarning: affiliateData.totalEarnings || 0,
            pendingEarning: affiliateData.pendingBalance || 0,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      // Fallback to demo data if API fails
      setUserStats({
        todayEarning: 3250,
        last7DaysEarning: 18750,
        last30DaysEarning: 67500,
        allTimeEarning: 125000,
        pendingEarning: 4200,
      })
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch("/api/courses/enrolled")
      if (response.ok) {
        const data = await response.json()
        setEnrolledCourses(data.courses || [])
      } else {
        // Fallback to demo data if API fails
        setEnrolledCourses([
          {
            _id: "1",
            title: "Advanced React Development Masterclass",
            thumbnail: "/placeholder.svg?height=200&width=400",
            progress: 75,
            packageName: "Full Stack Developer Bundle",
          },
          {
            _id: "2",
            title: "Node.js Backend Development",
            thumbnail: "/placeholder.svg?height=200&width=400",
            progress: 45,
            packageName: "Backend Developer Package",
          },
          {
            _id: "3",
            title: "Modern UI/UX Design Principles",
            thumbnail: "/placeholder.svg?height=200&width=400",
            progress: 100,
            packageName: "Design Mastery Suite",
          },
          {
            _id: "4",
            title: "Digital Marketing & SEO",
            thumbnail: "/placeholder.svg?height=200&width=400",
            progress: 0,
            packageName: "Marketing Pro Bundle",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error)
      // Fallback to demo data if API fails
      setEnrolledCourses([
        {
          _id: "1",
          title: "Advanced React Development Masterclass",
          thumbnail: "/placeholder.svg?height=200&width=400",
          progress: 75,
          packageName: "Full Stack Developer Bundle",
        },
        {
          _id: "2",
          title: "Node.js Backend Development",
          thumbnail: "/placeholder.svg?height=200&width=400",
          progress: 45,
          packageName: "Backend Developer Package",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
        <ModernAnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <ModernLoadingSkeleton />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <div className="p-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 w-fit mx-auto mb-6">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
      <ModernAnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Modern Profile Header */}
        <ModernProfileHeader user={session.user} />

        {/* Modern Compact Earnings Cards with Counter Animation */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <ModernEarningsCard
            title="Today's Earning"
            amount={userStats.todayEarning}
            icon={<Coins className="h-5 w-5" />}
            gradient="from-blue-600 via-blue-700 to-blue-800"
            delay={0}
            trend="+12%"
            trendUp={true}
          />
          <ModernEarningsCard
            title="Last 7 Days"
            amount={userStats.last7DaysEarning}
            icon={<Calendar className="h-5 w-5" />}
            gradient="from-emerald-600 via-green-700 to-teal-800"
            delay={200}
            trend="+8%"
            trendUp={true}
          />
          <ModernEarningsCard
            title="Last 30 Days"
            amount={userStats.last30DaysEarning}
            icon={<BarChart3 className="h-5 w-5" />}
            gradient="from-purple-600 via-violet-700 to-indigo-800"
            delay={400}
            trend="+15%"
            trendUp={true}
          />
          <ModernEarningsCard
            title="All Time Earning"
            amount={userStats.allTimeEarning}
            icon={<Trophy className="h-5 w-5" />}
            gradient="from-orange-600 via-red-700 to-pink-800"
            delay={600}
            trend="+25%"
            trendUp={true}
          />
          <ModernEarningsCard
            title="Pending Earning"
            amount={userStats.pendingEarning}
            icon={<Clock className="h-5 w-5" />}
            gradient="from-cyan-600 via-blue-700 to-indigo-800"
            delay={800}
            trend="-3%"
            trendUp={false}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/affiliate-link">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer h-24">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white">Refer & Earn</h3>
                    <p className="text-white/80 text-xs">Share and earn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/my-courses">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer h-24">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white">My Courses</h3>
                    <p className="text-white/80 text-xs">Continue learning</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/earnings">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer h-24">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white">Analytics</h3>
                    <p className="text-white/80 text-xs">View stats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/courses">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer h-24">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white">Explore</h3>
                    <p className="text-white/80 text-xs">Find courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Courses */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Recent Courses
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                {enrolledCourses.length} Active
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {enrolledCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 shadow-2xl">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Learning Journey</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  Discover amazing courses and unlock your potential with our comprehensive learning platform.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Link href="/courses">
                    <Rocket className="mr-2 h-5 w-5" />
                    Browse Courses
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {enrolledCourses.map((course: any) => (
                  <ModernCourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </CardContent>
          {enrolledCourses.length > 0 && (
            <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 p-6">
              <Button
                asChild
                variant="outline"
                className="w-full border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/dashboard/my-courses">
                  View All Courses
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
