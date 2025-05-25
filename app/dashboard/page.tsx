import type React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Clock,
  Play,
  ChevronRight,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Target,
  Sparkles,
  Trophy,
  Zap,
  Gift,
} from "lucide-react"

async function getEnrolledCourses(userId: string) {
  try {
    console.log("Fetching enrolled courses for dashboard...")
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/courses/enrolled`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("API error status:", response.status)
      return []
    }

    const data = await response.json()
    console.log(`Dashboard: Found ${data.courses?.length || 0} enrolled courses`)
    return data.courses || []
  } catch (error) {
    console.error("Error fetching enrolled courses for dashboard:", error)
    return []
  }
}

async function getUserStats(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/stats`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        totalEarnings: 0,
        referrals: 0,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      totalCourses: 0,
      completedCourses: 0,
      totalEarnings: 0,
      referrals: 0,
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const [enrolledCourses, userStats] = await Promise.all([
    getEnrolledCourses(session.user.id),
    getUserStats(session.user.id),
  ])

  console.log(`Dashboard rendering with ${enrolledCourses.length} courses`)

  const inProgressCourses = enrolledCourses
    .filter((course: any) => course.progress > 0 && course.progress < 100)
    .sort((a: any, b: any) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime())
    .slice(0, 3)

  const overallProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((sum: number, course: any) => sum + (course.progress || 0), 0) /
            enrolledCourses.length,
        )
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Professional Header */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  Welcome back, {session.user.name}
                </h1>
              </div>
              <p className="text-gray-600 ml-11">Track your learning progress and manage your account</p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <Link href="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/dashboard/affiliate-link">
                  <Users className="mr-2 h-4 w-4" />
                  Refer Friends
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Colorful Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Courses"
            value={enrolledCourses.length.toString()}
            icon={<BookOpen className="h-6 w-6" />}
            description="Enrolled courses"
            gradient="from-blue-500 to-cyan-500"
            bgGradient="from-blue-50 to-cyan-50"
            iconBg="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <StatsCard
            title="Completion Rate"
            value={`${overallProgress}%`}
            icon={<Target className="h-6 w-6" />}
            description="Overall progress"
            gradient="from-green-500 to-emerald-500"
            bgGradient="from-green-50 to-emerald-50"
            iconBg="bg-gradient-to-r from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Total Earnings"
            value={`₹${userStats.totalEarnings || 0}`}
            icon={<DollarSign className="h-6 w-6" />}
            description="From referrals"
            gradient="from-purple-500 to-violet-500"
            bgGradient="from-purple-50 to-violet-50"
            iconBg="bg-gradient-to-r from-purple-500 to-violet-500"
          />
          <StatsCard
            title="Referrals"
            value={(userStats.referrals || 0).toString()}
            icon={<Users className="h-6 w-6" />}
            description="People referred"
            gradient="from-orange-500 to-red-500"
            bgGradient="from-orange-50 to-red-50"
            iconBg="bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>

        {/* Main Content Grid with Enhanced Colors */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Continue Learning Section with Gradient */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 overflow-hidden">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Play className="h-5 w-5" />
                  </div>
                  Continue Learning
                </CardTitle>
                <CardDescription className="text-blue-100">Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Suspense fallback={<LoadingSkeleton />}>
                    {inProgressCourses.length === 0 ? (
                      <EmptyState />
                    ) : (
                      inProgressCourses.map((course: any) => <CourseProgressCard key={course._id} course={course} />)
                    )}
                  </Suspense>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                <Button asChild variant="outline" className="w-full border-blue-200 hover:bg-blue-50">
                  <Link href="/dashboard/my-courses">
                    View all courses
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Enhanced Learning Statistics */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50 overflow-hidden">
              <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Learning Stats
                </CardTitle>
                <CardDescription className="text-green-100">Your progress overview</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-gray-700">Overall Progress</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {overallProgress}%
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-3 bg-blue-100" />
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-gray-700">Courses Completed</span>
                    <span className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {enrolledCourses.filter((c: any) => c.progress === 100).length}/{enrolledCourses.length}
                    </span>
                  </div>
                  <Progress
                    value={
                      enrolledCourses.length > 0
                        ? (enrolledCourses.filter((c: any) => c.progress === 100).length / enrolledCourses.length) * 100
                        : 0
                    }
                    className="h-3 bg-green-100"
                  />
                </div>

                {/* Enhanced Weekly Activity Chart */}
                <div className="pt-4">
                  <h4 className="mb-4 font-semibold text-gray-700 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    Weekly Activity
                  </h4>
                  <div className="flex h-24 items-end gap-2 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const height = Math.floor(Math.random() * 100)
                      const colors = [
                        "from-blue-500 to-cyan-500",
                        "from-green-500 to-emerald-500",
                        "from-purple-500 to-violet-500",
                        "from-orange-500 to-red-500",
                        "from-pink-500 to-rose-500",
                        "from-indigo-500 to-blue-500",
                        "from-teal-500 to-green-500",
                      ]
                      return (
                        <div key={i} className="flex-1 group cursor-pointer">
                          <div
                            className={`w-full rounded-t bg-gradient-to-t ${colors[i]} hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                            style={{ height: `${height}%` }}
                          />
                          <div className="mt-2 text-center">
                            <span className="text-xs text-gray-500 font-medium">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Achievement Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 w-fit mx-auto mb-4 shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  Learning Streak!
                </h3>
                <p className="text-gray-600 mb-4">You've been consistent for 7 days</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-white/50 backdrop-blur-sm"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  View Achievements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
          <CardContent className="p-6">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-100 to-slate-100 p-1 rounded-xl">
                <TabsTrigger
                  value="courses"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  Recent Courses
                </TabsTrigger>
                <TabsTrigger
                  value="earnings"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  Recent Earnings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="mt-6">
                {enrolledCourses.length === 0 ? (
                  <EmptyCoursesState />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {enrolledCourses.slice(0, 4).map((course: any) => (
                      <CourseCard key={course._id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="earnings" className="mt-6">
                <EarningsSection userStats={userStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  description,
  gradient,
  bgGradient,
  iconBg,
}: {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  gradient: string
  bgGradient: string
  iconBg: string
}) {
  return (
    <Card
      className={`shadow-xl border-0 bg-gradient-to-br ${bgGradient} hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-gray-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</div>
          <p className="text-xs text-gray-500 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CourseProgressCard({ course }: { course: any }) {
  const totalLessons = course.videoLessons?.length || 0
  const completedLessons = course.completedLessons?.length || 0

  return (
    <div className="p-5 rounded-xl border-0 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
          <img
            src={course.thumbnail || "/placeholder.svg?height=100&width=150"}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h4>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {course.progress}%
            </span>
          </div>

          {course.packageName && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <Package className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-purple-700 font-medium line-clamp-1">{course.packageName}</span>
            </div>
          )}

          <Progress value={course.progress} className="h-2 bg-blue-100" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {completedLessons}/{totalLessons} lessons
            </span>
            <Button
              asChild
              size="sm"
              className="h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
            >
              <Link href={`/course/${course._id}`}>
                <Play className="mr-1 h-3 w-3" />
                Continue
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  const getStatusBadge = () => {
    if (course.progress === 100) {
      return (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-xs font-medium shadow-lg">
          Completed
        </span>
      )
    } else if (course.progress > 0) {
      return (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 text-xs font-medium shadow-lg">
          In Progress
        </span>
      )
    } else {
      return (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-gray-500 to-slate-500 text-white px-3 py-1 text-xs font-medium shadow-lg">
          Not Started
        </span>
      )
    }
  }

  const totalDuration =
    course.videoLessons?.reduce((total: number, lesson: any) => total + (lesson.duration || 0), 0) || 0
  const totalHours = Math.floor(totalDuration / 60)
  const totalMinutes = totalDuration % 60
  const formattedDuration =
    totalHours > 0
      ? `${totalHours} hr${totalHours > 1 ? "s" : ""} ${totalMinutes > 0 ? `${totalMinutes} min` : ""}`
      : `${totalMinutes} min`

  const totalLessons = course.videoLessons?.length || 0

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {getStatusBadge()}
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>

          {course.packageName && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <Package className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-purple-700 font-medium">{course.packageName}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1 p-2 rounded-lg bg-blue-50">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-blue-700 font-medium">{formattedDuration}</span>
            </div>
            <span className="p-2 rounded-lg bg-green-50 text-green-700 font-medium">
              {course.completedLessons?.length || 0}/{totalLessons} lessons
            </span>
          </div>

          <Progress value={course.progress || 0} className="h-2 bg-gray-100" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          size="sm"
        >
          <Link href={`/course/${course._id}`}>
            <Play className="mr-2 h-3 w-3" />
            {course.progress === 0 ? "Start Learning" : course.progress === 100 ? "Review Course" : "Continue Learning"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200">
            <div className="h-16 w-24 bg-gray-300 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 shadow-xl">
        <BookOpen className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
        Ready to start learning?
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm">Discover amazing courses and begin your learning journey today.</p>
      <Button
        asChild
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
      >
        <Link href="/courses">
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Courses
        </Link>
      </Button>
    </div>
  )
}

function EmptyCoursesState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mb-6 shadow-xl">
        <BookOpen className="h-16 w-16 text-white" />
      </div>
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
        No courses enrolled yet
      </h3>
      <p className="text-gray-600 mb-8 max-w-md">
        Start your learning journey today! Browse our catalog and find the perfect course for you.
      </p>
      <Button
        asChild
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
      >
        <Link href="/courses">
          <BookOpen className="mr-2 h-4 w-4" />
          Explore Courses
        </Link>
      </Button>
    </div>
  )
}

function EarningsSection({ userStats }: { userStats: any }) {
  return (
    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
      <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <DollarSign className="h-5 w-5" />
          </div>
          Earnings History
        </CardTitle>
        <CardDescription className="text-green-100">Your recent earnings from referrals</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {userStats.recentEarnings && userStats.recentEarnings.length > 0 ? (
          <div className="space-y-4">
            {userStats.recentEarnings.map((earning: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-green-50 border border-green-200 shadow-md"
              >
                <div>
                  <p className="font-semibold text-gray-900">{earning.type}</p>
                  <p className="text-sm text-gray-600">{earning.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    +₹{earning.amount}
                  </p>
                  <p className="text-xs text-gray-500">{earning.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-6 shadow-xl">
              <DollarSign className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Start earning today!
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm">
              Refer friends and family to earn commissions on their purchases.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
            >
              <Link href="/dashboard/affiliate-link">
                <Users className="mr-2 h-4 w-4" />
                Get Referral Link
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
        <Button asChild variant="outline" className="w-full border-green-200 hover:bg-green-50">
          <Link href="/dashboard/earnings">
            View all transactions
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
