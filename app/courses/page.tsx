"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Lock,
  ShoppingCart,
  Search,
  Grid,
  List,
  Zap,
  Heart,
  Share2,
  CheckCircle,
  Sparkles,
  Target,
  Globe,
  Crown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Course {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  instructor: string
  duration: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  studentCount: number
  level: string
  category: string
  tags: string[]
  lessons: any[]
  isPopular?: boolean
  isFeatured?: boolean
  createdAt: string
}

interface Package {
  _id: string
  title: string
  slug: string
  price: number
  originalPrice?: number
  courses: string[]
  isPopular?: boolean
}

export default function CoursesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [courses, setCourses] = useState<Course[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchCourses()
    fetchPackages()
    if (session?.user?.id) {
      fetchEnrolledCourses()
    }
  }, [session])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (!response.ok) throw new Error("Failed to fetch courses")

      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error: any) {
      console.error("Error fetching courses:", error)
      setError(error.message)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages")
      if (!response.ok) throw new Error("Failed to fetch packages")

      const data = await response.json()
      setPackages(data.packages || [])
    } catch (error: any) {
      console.error("Error fetching packages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch("/api/courses/enrolled")
      if (!response.ok) return

      const data = await response.json()
      setEnrolledCourses(data.enrolledCourses?.map((e: any) => e.course) || [])
    } catch (error) {
      console.error("Error fetching enrolled courses:", error)
    }
  }

  const handleCourseClick = async (course: Course) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to access courses",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Check if user is already enrolled
    if (enrolledCourses.includes(course._id)) {
      router.push(`/course/${course._id}`)
      return
    }

    // Check if course is available in any package
    const availablePackages = packages.filter((pkg) => pkg.courses.includes(course._id))

    if (availablePackages.length === 0) {
      toast({
        title: "Course Not Available",
        description: "This course is not currently available for purchase",
        variant: "destructive",
      })
      return
    }

    // Redirect to package selection or specific package
    if (availablePackages.length === 1) {
      router.push(`/packages/${availablePackages[0]._id}`)
    } else {
      // Show package selection modal or redirect to packages page with filter
      router.push(`/packages?course=${course._id}`)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.studentCount || 0) - (a.studentCount || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "price-low":
        return (a.price || 0) - (b.price || 0)
      case "price-high":
        return (b.price || 0) - (a.price || 0)
      default:
        return 0
    }
  })

  const categories = [...new Set(courses.map((course) => course.category))].filter(Boolean)
  const levels = [...new Set(courses.map((course) => course.level))].filter(Boolean)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-0 mb-6 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Discover Amazing Courses
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master New{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Skills Today
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Explore our comprehensive collection of courses designed by industry experts to accelerate your career
              growth.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{courses.length}+</div>
                <div className="opacity-80">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="opacity-80">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="opacity-80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses, instructors, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-gray-200 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {sortedCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Courses Grid/List */}
        {sortedCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all courses.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedLevel("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {sortedCourses.map((course, index) => {
              const isEnrolled = enrolledCourses.includes(course._id)
              const discountPercentage = course.originalPrice
                ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
                : 0

              return (
                <Card
                  key={course._id}
                  className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${
                    course.isPopular ? "ring-2 ring-purple-500/20" : ""
                  } ${viewMode === "list" ? "flex flex-row" : "flex flex-col"}`}
                  onClick={() => handleCourseClick(course)}
                >
                  {/* Course Image */}
                  <div className={`relative overflow-hidden ${viewMode === "list" ? "w-80 h-48" : "h-48"}`}>
                    <Image
                      src={course.thumbnail || `/placeholder.svg?height=300&width=400`}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {course.isPopular && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                          <Crown className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {course.isFeatured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                          <Zap className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {isEnrolled && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                          {discountPercentage}% OFF
                        </Badge>
                      </div>
                    )}

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        {isEnrolled ? (
                          <Play className="h-8 w-8 text-white ml-1" />
                        ) : (
                          <Lock className="h-8 w-8 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="outline" className="bg-white/90 text-gray-800 border-0">
                        {course.level || "All Levels"}
                      </Badge>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {course.category || "General"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <div className="flex items-center mr-4">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{course.rating || 4.8}</span>
                        <span className="ml-1">({course.reviewCount || 1250})</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.studentCount || 0} students</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration || "8 hours"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">By {course.instructor || "Expert Instructor"}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {course.lessons?.length || 24} lessons
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {course.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            ₹{course.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{course.price?.toLocaleString() || "Free"}
                        </span>
                      </div>

                      <Button
                        className={`${
                          isEnrolled
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        } text-white border-0`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCourseClick(course)
                        }}
                      >
                        {isEnrolled ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Package
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of students who are already advancing their careers with our expert-led courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8 py-6">
                <Link href="/packages">
                  <Target className="mr-2 h-5 w-5" />
                  View All Packages
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-medium px-8 py-6"
              >
                <Link href="/contact">
                  <Globe className="mr-2 h-5 w-5" />
                  Get Expert Advice
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
