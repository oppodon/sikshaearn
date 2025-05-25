"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, PackageIcon, User, Play, RefreshCw, Loader2, BookOpen } from "lucide-react"

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
    } catch (err) {
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading your courses...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Authentication Required</CardTitle>
              <CardDescription className="text-gray-600">Please log in to view your courses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <Card className="shadow-sm border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Courses</CardTitle>
              <CardDescription className="text-red-600">
                There was an error loading your courses. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-md border border-red-200">
                  <p className="text-sm font-medium text-gray-900">Error Details:</p>
                  <p className="text-xs text-gray-600">{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">No Data Available</CardTitle>
              <CardDescription className="text-gray-600">Unable to load course data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchCourses} className="bg-blue-600 hover:bg-blue-700">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Access your enrolled courses and track your progress</p>
          </div>
          <Button variant="outline" onClick={fetchCourses} disabled={loading} className="border-gray-300">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <PackageIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">Packages</h3>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPackages}</div>
                <p className="text-xs text-gray-500">Enrolled packages</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">Courses</h3>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                <p className="text-xs text-gray-500">Available courses</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
                <div className="text-2xl font-bold text-gray-900">{stats.inProgressCourses}</div>
                <p className="text-xs text-gray-500">Courses started</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Play className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                <div className="text-2xl font-bold text-gray-900">{stats.completedCourses}</div>
                <p className="text-xs text-gray-500">Courses finished</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {courses.length === 0 ? (
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">No Courses Found</CardTitle>
              <CardDescription className="text-gray-600">
                {transactions.length > 0
                  ? "You have completed transactions but no courses are enrolled. This might be a sync issue - please refresh the page or contact support."
                  : "You haven't enrolled in any courses yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Debug Information:</p>
                <ul className="space-y-1">
                  <li>• Completed Transactions: {transactions.length}</li>
                  <li>• Active Enrollments: {enrollments.length}</li>
                  <li>• Available Courses: {courses.length}</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/packages">Browse Packages</Link>
                </Button>
                <Button variant="outline" onClick={fetchCourses} className="border-gray-300">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 mb-6">
              <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
              <TabsTrigger value="not-started">
                Not Started ({courses.filter((c) => c.status === "not-started").length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({courses.filter((c) => c.status === "in-progress").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({courses.filter((c) => c.status === "completed").length})
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
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
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
          className="overflow-hidden shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="relative h-48 w-full">
            <img
              src={course.thumbnail || "/placeholder.svg?height=192&width=384"}
              alt={course.title}
              className="h-full w-full object-cover"
            />
            {course.status === "completed" && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
              </div>
            )}
            {course.status === "in-progress" && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
              </div>
            )}
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 line-clamp-2">{course.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1.5 mt-1 text-gray-600">
                <PackageIcon className="h-3 w-3" />
                <span className="text-sm">Package: {course.packageTitle}</span>
              </div>
              {course.instructor && (
                <div className="flex items-center gap-1.5 mt-1 text-gray-600">
                  <User className="h-3 w-3" />
                  <span className="text-sm">Instructor: {course.instructor}</span>
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
              <Progress value={course.progress || 0} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.level && (
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                  {course.level}
                </Badge>
              )}
              {course.duration && (
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {course.duration}
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
              </div>
              {course.lastAccessed && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
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
