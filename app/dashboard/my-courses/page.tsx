import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, PackageIcon, User, Play } from "lucide-react"
import mongoose from "mongoose"

// Loading component
function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Skeleton className="h-full w-full" />
          </div>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-5 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// Fetch user enrollments and courses
async function fetchCourses(userId: string) {
  console.log("Fetching courses for user:", userId)

  try {
    await connectToDatabase()

    // Import models directly to ensure they're registered
    require("@/models/Package")
    require("@/models/Course")
    require("@/models/Enrollment")
    require("@/models/Transaction")

    // Get all transactions for the user
    const transactions = await mongoose
      .model("Transaction")
      .find({
        user: userId,
        status: "approved",
      })
      .lean()

    console.log(`Found ${transactions.length} approved transactions`)

    if (!transactions.length) {
      return { courses: [], enrollments: [], transactions: [] }
    }

    // Get all enrollments for the user
    const enrollments = await mongoose
      .model("Enrollment")
      .find({
        user: userId,
        isActive: true,
      })
      .lean()

    console.log(`Found ${enrollments.length} active enrollments`)

    // Get all package IDs from transactions
    const packageIds = transactions.map((t) => t.package)

    // Get all packages with their courses
    const packages = await mongoose
      .model("Package")
      .find({
        _id: { $in: packageIds },
      })
      .populate("courses")
      .lean()

    console.log(`Found ${packages.length} packages with courses`)

    // Extract all courses from all packages
    const allCourses = []

    for (const pkg of packages) {
      console.log(`Package ${pkg.title || pkg.name} has ${pkg.courses?.length || 0} courses`)

      if (!pkg.courses || !Array.isArray(pkg.courses) || pkg.courses.length === 0) {
        console.log(`No courses found in package ${pkg._id}`)
        continue
      }

      // Find enrollment for this package
      const enrollment = enrollments.find((e) => e.package && e.package.toString() === pkg._id.toString())

      for (const course of pkg.courses) {
        if (!course) continue

        // Calculate progress if there's an enrollment
        let progress = 0
        let completedLessons = []

        if (enrollment) {
          completedLessons = enrollment.completedLessons || []
          const totalLessons = course.videoLessons?.length || 10
          progress =
            totalLessons > 0
              ? Math.round(
                  (completedLessons.filter((l) => l.course && l.course.toString() === course._id.toString()).length /
                    totalLessons) *
                    100,
                )
              : 0
        }

        allCourses.push({
          ...course,
          packageTitle: pkg.title || pkg.name,
          packageId: pkg._id,
          enrollmentId: enrollment?._id,
          progress: progress,
          completedLessons: completedLessons,
          enrolledAt: enrollment?.startDate || enrollment?.createdAt,
          lastAccessed: enrollment?.lastAccessed,
          status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
        })
      }
    }

    console.log(`Returning ${allCourses.length} courses`)
    return {
      courses: allCourses,
      enrollments,
      transactions,
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw new Error(`Failed to fetch courses: ${error.message}`)
  }
}

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
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

  try {
    const { courses, enrollments, transactions } = await fetchCourses(session.user.id)

    // Calculate stats
    const totalPackages = new Set(enrollments.map((e) => e.package?.toString())).size
    const totalCourses = courses.length
    const inProgressCourses = courses.filter((c) => c.status === "in-progress").length
    const completedCourses = courses.filter((c) => c.status === "completed").length

    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">Access your enrolled courses and track your progress</p>
        </div>

        {/* Debug Info */}
        <Card className="mb-6 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Enrollment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p>
                <strong>User ID:</strong> {session.user.id}
              </p>
              <p>
                <strong>Transactions:</strong> {transactions.length} approved transactions
              </p>
              <p>
                <strong>Enrollments:</strong> {enrollments.length} active enrollments
              </p>
              <p>
                <strong>Packages:</strong> {totalPackages} packages
              </p>
              <p>
                <strong>Courses:</strong> {totalCourses} courses available
              </p>
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
              <p className="text-3xl font-bold">{totalPackages}</p>
              <p className="text-sm text-muted-foreground">Enrolled packages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalCourses}</p>
              <p className="text-sm text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{inProgressCourses}</p>
              <p className="text-sm text-muted-foreground">Courses started</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedCourses}</p>
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
                  ? "You have approved transactions but no courses are enrolled. Please contact support."
                  : "You haven't enrolled in any courses yet."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/packages">Browse Packages</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tabs for filtering */}
            <Tabs defaultValue="all" className="w-full mb-6">
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
          </>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in MyCoursesPage:", error)
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Courses</CardTitle>
            <CardDescription className="text-red-600">
              {error.message || "There was an error loading your courses. Please try again."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md mb-4 overflow-auto max-h-40">
              <pre className="text-xs">{error.stack}</pre>
            </div>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}

function CourseGrid({ courses }) {
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
