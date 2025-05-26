"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, PackageIcon, User, Play, RefreshCw, BookOpen, Star, Award, TrendingUp } from "lucide-react"

interface Course {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  instructor: string
  level: string
  duration: string
  videoLessons: any[]
  packageTitle: string
  packageId: string
  enrollmentId: string
  progress: number
  completedLessons: string[]
  enrolledAt: string
  lastAccessed: string
  status: "not-started" | "in-progress" | "completed"
}

interface CourseData {
  courses: Course[]
  enrollments: any[]
  transactions: any[]
  stats: {
    totalPackages: number
    totalCourses: number
    inProgressCourses: number
    completedCourses: number
  }
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession()
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/courses")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch courses")
      }

      if (data.success) {
        setCourseData(data)
      } else {
        throw new Error(data.message || "Failed to fetch courses")
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchCourses()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                ></div>
              </div>
              <p className="text-gray-600 font-medium">Loading your courses...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your learning journey</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Authentication Required
              </CardTitle>
              <CardDescription className="text-red-100">Please log in to view your courses.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Link href="/login?callbackUrl=/dashboard/my-courses">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-t-lg">
              <CardTitle className="text-red-100">Error Loading Courses</CardTitle>
              <CardDescription className="text-red-200">
                There was an error loading your courses. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Error Details:</p>
                  <p className="text-xs text-gray-600">{String(error)}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Link href="/dashboard">Return to Dashboard</Link>
                  </Button>
                  <Button variant="outline" onClick={fetchCourses} className="border-gray-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">No Data Available</CardTitle>
              <CardDescription className="text-gray-600">Unable to load course data.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={fetchCourses}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { courses, enrollments, transactions, stats } = courseData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              My Learning Journey
            </h1>
            <p className="text-gray-600">Access your enrolled courses and track your progress</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchCourses}
            disabled={loading}
            className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 shadow-md"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <PackageIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalPackages}</div>
                  <p className="text-xs text-gray-600">Packages</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Enrolled Packages</h3>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                  <p className="text-xs text-gray-600">Courses</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Available Courses</h3>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.inProgressCourses}</div>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Active Learning</h3>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.completedCourses}</div>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Achievements</h3>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {courses.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                No Courses Found
              </CardTitle>
              <CardDescription className="text-gray-100">
                {transactions.length > 0
                  ? "You have completed transactions but no courses are enrolled. This might be a sync issue - please refresh the page or contact support."
                  : "You haven't enrolled in any courses yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
                <p className="font-medium mb-2">Debug Information:</p>
                <ul className="space-y-1">
                  <li>• Completed Transactions: {transactions.length}</li>
                  <li>• Active Enrollments: {enrollments.length}</li>
                  <li>• Available Courses: {courses.length}</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Link href="/packages">Browse Packages</Link>
                </Button>
                <Button variant="outline" onClick={fetchCourses} className="border-gray-300 hover:bg-blue-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
              >
                All ({courses.length})
              </TabsTrigger>
              <TabsTrigger
                value="not-started"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
              >
                New ({courses.filter((c) => c.status === "not-started").length})
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
              >
                Active ({courses.filter((c) => c.status === "in-progress").length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
              >
                Done ({courses.filter((c) => c.status === "completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <CourseGrid courses={courses} />
            </TabsContent>

            <TabsContent value="not-started" className="mt-6">
              <CourseGrid courses={courses.filter((c) => c.status === "not-started")} />
            </TabsContent>

            <TabsContent value="in-progress" className="mt-6">
              <CourseGrid courses={courses.filter((c) => c.status === "in-progress")} />
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <CourseGrid courses={courses.filter((c) => c.status === "completed")} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function CourseGrid({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600">No courses match the selected filter.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card
          key={course._id}
          className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
        >
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={course.thumbnail || "/placeholder.svg?height=192&width=384"}
              alt={course.title || "Course"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {course.status === "completed" && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                  <Award className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            )}
            {course.status === "in-progress" && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              </div>
            )}
            {course.status === "not-started" && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  New
                </Badge>
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button asChild className="w-full bg-white/90 text-gray-900 hover:bg-white shadow-lg backdrop-blur-sm">
                <Link href={`/course/${course._id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  {course.status === "completed"
                    ? "Review Course"
                    : course.status === "in-progress"
                      ? "Continue Learning"
                      : "Start Course"}
                </Link>
              </Button>
            </div>
          </div>

          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {course.title || "Untitled Course"}
            </CardTitle>
            <CardDescription className="space-y-2">
              <div className="flex items-center gap-1.5 text-gray-600">
                <PackageIcon className="h-3 w-3" />
                <span className="text-sm">Package: {course.packageTitle || "Unknown"}</span>
              </div>
              {course.instructor && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="h-3 w-3" />
                  <span className="text-sm">Instructor: {String(course.instructor)}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-blue-600">{course.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {course.level && (
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                  {String(course.level)}
                </Badge>
              )}
              {course.duration && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-200 text-green-700 bg-green-50 flex items-center"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {String(course.duration)}
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-2" />
                Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
              </div>
              {course.lastAccessed && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Link href={`/course/${course._id}`}>
                <Play className="h-4 w-4 mr-2" />
                {course.status === "completed"
                  ? "Review Course"
                  : course.status === "in-progress"
                    ? "Continue Learning"
                    : "Start Course"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
