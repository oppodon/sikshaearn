"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Clock,
  Play,
  Search,
  Filter,
  Award,
  Package,
  CheckCircle,
  Calendar,
  BarChart,
  AlertCircle,
  ShoppingCart,
  RefreshCw,
  Bug,
} from "lucide-react"

interface Course {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  instructor: string
  packageName?: string
  progress: number
  completedLessons: string[]
  videoLessons: any[]
  lastAccessed?: string
  enrolledAt?: string
  status?: string
  enrollmentId?: string
}

interface DebugInfo {
  userId: string
  transactions: any[]
  enrollments: any[]
  packages: any[]
  coursesCount: number
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  const fetchCourses = async () => {
    if (status === "loading") return
    if (!session?.user) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/courses/enrolled")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.courses) {
        setCourses(data.courses)
        setFilteredCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error)
      setError("Failed to load your courses. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch("/api/debug/enrollments")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
      }
    } catch (error) {
      console.error("Error fetching debug info:", error)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [session, status])

  useEffect(() => {
    // Filter courses based on search query and filter value
    let filtered = [...courses]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterValue !== "all") {
      switch (filterValue) {
        case "in-progress":
          filtered = filtered.filter((course) => course.progress > 0 && course.progress < 100)
          break
        case "completed":
          filtered = filtered.filter((course) => course.progress === 100)
          break
        case "not-started":
          filtered = filtered.filter((course) => course.progress === 0)
          break
        case "recent":
          filtered = [...filtered].sort(
            (a, b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime(),
          )
          break
      }
    }

    setFilteredCourses(filtered)
  }, [searchQuery, filterValue, courses])

  // Filter courses by progress status
  const notStartedCourses = filteredCourses.filter((course) => course.progress === 0)
  const inProgressCourses = filteredCourses.filter((course) => course.progress > 0 && course.progress < 100)
  const completedCourses = filteredCourses.filter((course) => course.progress === 100)

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Courses</h1>
            <p className="text-muted-foreground">Track your learning progress and continue where you left off</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCourses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDebug(!showDebug)
                if (!showDebug) fetchDebugInfo()
              }}
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </Button>
          </div>
        </div>
      </div>

      {showDebug && debugInfo && (
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <p>
                <strong>User ID:</strong> {debugInfo.userId}
              </p>
              <p>
                <strong>Transactions:</strong> {debugInfo.transactions.length} (
                {debugInfo.transactions.filter((t) => t.status === "completed").length} completed)
              </p>
              <p>
                <strong>Enrollments:</strong> {debugInfo.enrollments.length}
              </p>
              <p>
                <strong>Packages:</strong> {debugInfo.packages.length}
              </p>
              <p>
                <strong>Total Courses:</strong> {debugInfo.coursesCount}
              </p>
              {debugInfo.transactions.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View Transactions</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo.transactions, null, 2)}
                  </pre>
                </details>
              )}
              {debugInfo.enrollments.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View Enrollments</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo.enrollments, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="recent">Recently Accessed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          <Tabs defaultValue="all" className="w-full mt-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                All ({filteredCourses.length})
              </TabsTrigger>
              <TabsTrigger value="not-started" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Not Started ({notStartedCourses.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                In Progress ({inProgressCourses.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Completed ({completedCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="not-started" className="mt-6">
              {notStartedCourses.length === 0 ? (
                <EmptyState
                  title="No courses to start"
                  description="All your courses are either in progress or completed"
                  actionLabel="View All Courses"
                  actionHref="#"
                  onClick={() => document.querySelector('[data-value="all"]')?.click()}
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {notStartedCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-6">
              {inProgressCourses.length === 0 ? (
                <EmptyState
                  title="No courses in progress"
                  description="Start learning to see your courses here"
                  actionLabel="View All Courses"
                  actionHref="#"
                  onClick={() => document.querySelector('[data-value="all"]')?.click()}
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {inProgressCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedCourses.length === 0 ? (
                <EmptyState
                  title="No completed courses yet"
                  description="Keep learning to complete your courses"
                  actionLabel="View All Courses"
                  actionHref="#"
                  onClick={() => document.querySelector('[data-value="all"]')?.click()}
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {completedCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <EmptyState
          title="No enrolled courses yet"
          description="Browse our catalog to find courses that interest you"
          actionLabel="Explore Courses"
          actionHref="/courses"
        />
      )}
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const getStatusBadge = () => {
    if (course.status === "inactive") {
      return (
        <Badge variant="outline" className="absolute right-3 top-3 bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Pending Approval
        </Badge>
      )
    } else if (course.progress === 100) {
      return (
        <Badge variant="outline" className="absolute right-3 top-3 bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>
      )
    } else if (course.progress > 0) {
      return (
        <Badge variant="outline" className="absolute right-3 top-3 bg-blue-100 text-blue-800 border-blue-200">
          <BarChart className="h-3 w-3 mr-1" /> {course.progress}% Complete
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="absolute right-3 top-3 bg-gray-100 text-gray-800 border-gray-200">
          <Clock className="h-3 w-3 mr-1" /> Not Started
        </Badge>
      )
    }
  }

  const getButtonText = () => {
    if (course.status === "inactive") return "View Details"
    if (course.progress === 0) return "Start Learning"
    if (course.progress === 100) return "Review Course"
    return "Continue Learning"
  }

  // Calculate total duration from all video lessons
  const totalDuration = course.videoLessons?.reduce((total, lesson) => total + (lesson.duration || 0), 0) || 0
  const totalHours = Math.floor(totalDuration / 60)
  const totalMinutes = totalDuration % 60
  const formattedDuration =
    totalHours > 0
      ? `${totalHours} hr${totalHours > 1 ? "s" : ""} ${totalMinutes > 0 ? `${totalMinutes} min` : ""}`
      : `${totalMinutes} min`

  // Get total number of lessons
  const totalLessons = course.videoLessons?.length || 0

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
        {getStatusBadge()}
      </div>
      <CardContent className="p-4 flex-grow">
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

          {course.status !== "inactive" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">{course.progress || 0}%</span>
              </div>
              <Progress value={course.progress || 0} className="h-2" />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Enrolled: {formatDate(course.enrolledAt)}</span>
          </div>

          {course.lastAccessed && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last accessed: {formatDate(course.lastAccessed)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          asChild={course.status !== "inactive"}
          className="w-full"
          size="sm"
          variant={course.status === "inactive" ? "outline" : "default"}
        >
          {course.status !== "inactive" ? (
            <Link href={`/course/${course._id}`}>
              <Play className="mr-2 h-4 w-4" />
              {getButtonText()}
            </Link>
          ) : (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Awaiting Approval
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onClick,
}: {
  title: string
  description: string
  actionLabel: string
  actionHref: string
  onClick?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
      <div className="mx-auto max-w-sm text-center">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild onClick={onClick}>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/packages">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Browse Packages
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
