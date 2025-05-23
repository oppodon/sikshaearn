"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, Filter, MoreHorizontal, Plus, Search, Pencil, Eye, Archive, Trash, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface Course {
  _id: string
  title: string
  slug: string
  description: string
  instructor: string
  thumbnail: string
  status: string
  enrollmentCount?: number
  packages?: Array<{ title: string; slug: string; price: number }>
  createdAt: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [activeTab, searchQuery, pagination.page])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const status = activeTab !== "all" ? activeTab : ""
      const url = `/api/courses?page=${pagination.page}&limit=${pagination.limit}${
        status ? `&status=${status}` : ""
      }${searchQuery ? `&search=${searchQuery}` : ""}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data.courses || [])
      setPagination(data.pagination || pagination)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching courses")
      toast({
        title: "Error",
        description: err.message || "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination({ ...pagination, page: 1 })
    fetchCourses()
  }

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update course status")
      }

      toast({
        title: "Success",
        description: `Course status updated to ${newStatus}`,
      })

      fetchCourses()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update course status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      })

      fetchCourses()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    if (!status)
      return (
        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
          Draft
        </Badge>
      )

    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Published
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            Draft
          </Badge>
        )
      case "archived":
        return (
          <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
            Archived
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Add New Course
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Courses</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-full pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-center text-red-500">{error}</div>
              ) : courses.length === 0 ? (
                <div className="rounded-md bg-gray-50 p-8 text-center">
                  <p className="text-muted-foreground">No courses found</p>
                  <Button asChild className="mt-4">
                    <Link href="/admin/courses/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Course
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Packages</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-16 overflow-hidden rounded-md">
                                <Image
                                  src={course.thumbnail || "/placeholder.svg?height=40&width=64"}
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="font-medium">{course.title}</div>
                            </div>
                          </TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>{getStatusBadge(course.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{course.enrollmentCount || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {course.packages && course.packages.length > 0 ? (
                                course.packages.slice(0, 2).map((pkg) => (
                                  <Badge key={pkg.slug} variant="secondary" className="text-xs">
                                    {pkg.title}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">No packages</span>
                              )}
                              {course.packages && course.packages.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{course.packages.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(course.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/courses/${course.slug}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Course
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/courses/${course.slug}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Course
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {course.status !== "published" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(course._id, "published")}>
                                    <Badge className="mr-2 bg-green-100 text-green-800">P</Badge>
                                    Publish Course
                                  </DropdownMenuItem>
                                )}
                                {course.status !== "draft" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(course._id, "draft")}>
                                    <Badge className="mr-2 bg-amber-100 text-amber-800">D</Badge>
                                    Move to Draft
                                  </DropdownMenuItem>
                                )}
                                {course.status !== "archived" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(course._id, "archived")}>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive Course
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteCourse(course._id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Course
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {pagination.total > 0 ? (
                    <>
                      Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> to{" "}
                      <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{" "}
                      <strong>{pagination.total}</strong> courses
                    </>
                  ) : (
                    "No courses found"
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
