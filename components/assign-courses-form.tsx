"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface Course {
  _id: string
  title: string
  slug: string
  thumbnail?: string
}

interface PackageData {
  _id: string
  title: string
  courses: Course[]
}

export default function AssignCoursesForm({
  packageData,
  allCourses,
}: {
  packageData: PackageData
  allCourses: Course[]
}) {
  const router = useRouter()
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize with already assigned courses
  useEffect(() => {
    if (packageData.courses) {
      setSelectedCourses(packageData.courses.map((course) => course._id))
    }
  }, [packageData])

  const filteredCourses = allCourses.filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/admin/packages/assign-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: packageData._id,
          courseIds: selectedCourses,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign courses")
      }

      toast({
        title: "Courses assigned successfully",
        description: `${selectedCourses.length} courses assigned to ${packageData.title}`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error assigning courses:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign courses",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Select Courses</h2>
          <p className="text-muted-foreground">{selectedCourses.length} courses selected</p>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          Save Changes
        </Button>
      </div>

      <Input
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start p-4">
                <Checkbox
                  id={`course-${course._id}`}
                  checked={selectedCourses.includes(course._id)}
                  onCheckedChange={() => handleToggleCourse(course._id)}
                  className="mr-3 mt-1"
                />
                <div>
                  <label htmlFor={`course-${course._id}`} className="font-medium cursor-pointer">
                    {course.title}
                  </label>
                  <p className="text-sm text-muted-foreground">{course.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No courses found</p>
        </div>
      )}
    </div>
  )
}
