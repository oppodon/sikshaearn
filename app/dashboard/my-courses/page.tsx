"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, PackageIcon, User, Play, RefreshCw, Loader2 } from "lucide-react"

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
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your courses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?callbackUrl=/dashboard/my-courses">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Courses</CardTitle>
            <CardDescription className="text-red-600">
              There was an error loading your courses. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md">
                <p className="text-sm font-medium">Error Details:</p>
                <p className="text-xs text-gray-600">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={fetchCourses}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Unable to load course data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchCourses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { courses, enrollments, transactions, stats } = courseData

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">Access your enrolled courses and track your progress</p>
        </div>
        <Button variant="outline" onClick={fetchCourses} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Debug Info */}
      <Card className="mb-6 bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Enrollment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>User ID:</strong>
              <br />
              {session?.user?.id}
            </div>
            <div>
              <strong>Completed Transactions:</strong>
              <br />
              {transactions.length}
            </div>
            <div>
              <strong>Active Enrollments:</strong>
              <br />
              {enrollments.length}
            </div>
            <div>
              <strong>Available Courses:</strong>
              <br />
              {stats.totalCourses}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPackages}</p>
            <p className="text-sm text-muted-foreground">Enrolled packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCourses}</p>
            <p className="text-sm text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.inProgressCourses}</p>
            <p className="text-sm text-muted-foreground">Courses started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completedCourses}</p>
            <p className="text-sm text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Found</CardTitle>
            <CardDescription>
              {transactions.length > 0
                ? "You have completed transactions but no courses are enrolled. This might be a sync issue - please refresh the page or contact support."
                : "You haven't enrolled in any courses yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Debug Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Completed Transactions: {transactions.length}</li>
                <li>Active Enrollments: {enrollments.length}</li>
                <li>Available Courses: {courses.length}</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/packages">Browse Packages</Link>
              </Button>
              <Button variant="outline" onClick={fetchCourses}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
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
  )
}

function CourseGrid({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Courses Found</CardTitle>
          <CardDescription>No courses match the selected filter.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course._id} className="overflow-hidden flex flex-col h-full">
          <div className="relative h-48 w-full">
            <img
              src={course.thumbnail || "/placeholder.svg?height=192&width=384"}
              alt={course.title}
              className="h-full w-full object-cover"
            />
            {course.status === "completed" && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
              </div>
            )}
            {course.status === "in-progress" && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1.5 mt-1">
                <PackageIcon className="h-4 w-4" />
                <span>Package: {course.packageTitle}</span>
              </div>
              {course.instructor && (
                <div className="flex items-center gap-1.5 mt-1">
                  <User className="h-4 w-4" />
                  <span>Instructor: {course.instructor}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Progress</span>
                <span className="text-sm font-medium">{course.progress || 0}%</span>
              </div>
              <Progress value={course.progress || 0} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.level && (
                <Badge variant="outline" className="text-xs">
                  {course.level}
                </Badge>
              )}
              {course.duration && (
                <Badge variant="outline" className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {course.duration}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
            </div>
            {course.lastAccessed && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-4 w-4 mr-1" />
                Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
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
