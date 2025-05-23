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
import { BookOpen, Clock, Play, Award, ChevronRight, Users, DollarSign, Package } from "lucide-react"

async function getEnrolledCourses(userId: string) {
  try {
    console.log("Fetching enrolled courses for dashboard...")
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/courses/enrolled`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("API error status:", response.status)
      return [] // Return empty array instead of throwing
    }

    const data = await response.json()
    console.log(`Dashboard: Found ${data.courses?.length || 0} enrolled courses`)
    return data.courses || []
  } catch (error) {
    console.error("Error fetching enrolled courses for dashboard:", error)
    return [] // Return empty array on error
  }
}

async function getUserStats(userId: string) {
  try {
    // Get real stats from API
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/stats`, {
      cache: "no-store",
    })

    if (!response.ok) {
      // Fallback to default stats
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
    // Fallback to default stats
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

  // Get in-progress courses
  const inProgressCourses = enrolledCourses
    .filter((course: any) => course.progress > 0 && course.progress < 100)
    .sort((a: any, b: any) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime())
    .slice(0, 3)

  // Calculate overall progress
  const overallProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((sum: number, course: any) => sum + (course.progress || 0), 0) /
            enrolledCourses.length,
        )
      : 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {session.user.name}</h2>
        <p className="text-muted-foreground">Here's an overview of your learning progress and recent activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Courses"
          value={enrolledCourses.length.toString()}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          description="Enrolled courses"
        />
        <StatsCard
          title="Completion Rate"
          value={`${overallProgress}%`}
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          description="Overall progress"
        />
        <StatsCard
          title="Total Earnings"
          value={`₹${userStats.totalEarnings || 0}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="From referrals"
        />
        <StatsCard
          title="Referrals"
          value={(userStats.referrals || 0).toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="People referred"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-7 md:col-span-4">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Suspense fallback={<p>Loading courses...</p>}>
                {inProgressCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No courses in progress</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Start learning to see your progress here</p>
                    <Button asChild className="mt-4">
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  inProgressCourses.map((course: any) => <CourseProgressCard key={course._id} course={course} />)
                )}
              </Suspense>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/my-courses">
                View all courses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-7 md:col-span-3">
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
            <CardDescription>Your learning activity</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">Courses Completed</span>
                  <span>
                    {enrolledCourses.filter((c: any) => c.progress === 100).length}/{enrolledCourses.length}
                  </span>
                </div>
                <Progress
                  value={
                    enrolledCourses.length > 0
                      ? (enrolledCourses.filter((c: any) => c.progress === 100).length / enrolledCourses.length) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>

              <div className="pt-4">
                <h4 className="mb-3 font-medium">Learning Activity</h4>
                <div className="flex h-24 items-end gap-1">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const height = Math.floor(Math.random() * 100)
                    return <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${height}%` }} />
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">Recent Courses</TabsTrigger>
            <TabsTrigger value="earnings">Recent Earnings</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="mt-6">
            {enrolledCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-xl font-medium">No courses enrolled yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse our catalog and enroll in courses to start learning
                </p>
                <Button asChild className="mt-6">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {enrolledCourses.slice(0, 4).map((course: any) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="earnings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Your recent earnings from referrals</CardDescription>
              </CardHeader>
              <CardContent>
                {userStats.recentEarnings && userStats.recentEarnings.length > 0 ? (
                  <div className="space-y-4">
                    {userStats.recentEarnings.map((earning: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">{earning.type}</p>
                          <p className="text-sm text-muted-foreground">{earning.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+₹{earning.amount}</p>
                          <p className="text-xs text-muted-foreground">{earning.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No earnings yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Refer friends to earn commissions on their purchases
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/affiliate-link">Get Referral Link</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/earnings">
                    View all transactions
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  description,
}: { title: string; value: string; icon: React.ReactNode; description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function CourseProgressCard({ course }: { course: any }) {
  // Calculate total lessons
  const totalLessons = course.videoLessons?.length || 0
  const completedLessons = course.completedLessons?.length || 0

  return (
    <div className="flex items-center space-x-4">
      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={course.thumbnail || "/placeholder.svg?height=100&width=150"}
          alt={course.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium line-clamp-1">{course.title}</h4>
          <span className="text-sm text-muted-foreground">{course.progress}%</span>
        </div>

        {course.packageName && (
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground line-clamp-1">{course.packageName}</span>
          </div>
        )}

        <Progress value={course.progress} className="h-1.5" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {completedLessons}/{totalLessons} lessons completed
          </span>
          <Button asChild variant="ghost" size="sm" className="h-6 px-2">
            <Link href={`/course/${course._id}`}>
              <Play className="mr-1 h-3 w-3" />
              Continue
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  const getStatusBadge = () => {
    if (course.progress === 100) {
      return (
        <span className="absolute right-3 top-3 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Completed
        </span>
      )
    } else if (course.progress > 0) {
      return (
        <span className="absolute right-3 top-3 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          In Progress
        </span>
      )
    } else {
      return (
        <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          Not Started
        </span>
      )
    }
  }

  // Calculate total duration from all video lessons
  const totalDuration =
    course.videoLessons?.reduce((total: number, lesson: any) => total + (lesson.duration || 0), 0) || 0
  const totalHours = Math.floor(totalDuration / 60)
  const totalMinutes = totalDuration % 60
  const formattedDuration =
    totalHours > 0
      ? `${totalHours} hr${totalHours > 1 ? "s" : ""} ${totalMinutes > 0 ? `${totalMinutes} min` : ""}`
      : `${totalMinutes} min`

  // Get total number of lessons
  const totalLessons = course.videoLessons?.length || 0

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
        {getStatusBadge()}
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{course.title}</h3>

          {course.packageName && (
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{course.packageName}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formattedDuration}</span>
            </div>
            <span>
              {course.completedLessons?.length || 0}/{totalLessons} lessons
            </span>
          </div>

          <div className="space-y-1.5">
            <Progress value={course.progress || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" size="sm">
          <Link href={`/course/${course._id}`}>
            <Play className="mr-2 h-4 w-4" />
            {course.progress === 0 ? "Start Learning" : course.progress === 100 ? "Review Course" : "Continue Learning"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
