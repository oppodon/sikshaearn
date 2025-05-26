"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash, Video } from "lucide-react"
import { CustomImageUpload } from "@/components/custom-image-upload"

interface Package {
  _id: string
  name: string
}

interface VideoLesson {
  title: string
  videoUrl: string
  duration: string
}

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
  })

  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([{ title: "", videoUrl: "", duration: "" }])

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true)
        const response = await fetch("/api/packages")

        if (!response.ok) {
          throw new Error("Failed to fetch packages")
        }

        const data = await response.json()
        setPackages(data.packages || [])
      } catch (error) {
        console.error("Error fetching packages:", error)
        setPackages([])
        toast({
          title: "Error",
          description: "Failed to load packages",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPackages(false)
      }
    }

    fetchPackages()
  }, [toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoLessonChange = (index: number, field: string, value: string) => {
    const updatedLessons = [...videoLessons]
    updatedLessons[index] = { ...updatedLessons[index], [field]: value }
    setVideoLessons(updatedLessons)
  }

  const addVideoLesson = () => {
    setVideoLessons([...videoLessons, { title: "", videoUrl: "", duration: "" }])
  }

  const removeVideoLesson = (index: number) => {
    if (videoLessons.length === 1) return
    const updatedLessons = videoLessons.filter((_, i) => i !== index)
    setVideoLessons(updatedLessons)
  }

  const handlePackageChange = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages([...selectedPackages, packageId])
    } else {
      setSelectedPackages(selectedPackages.filter((id) => id !== packageId))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Validate video lessons
      const validLessons = videoLessons.filter(
        (lesson) => lesson.title.trim() !== "" && lesson.videoUrl.trim() !== "" && lesson.duration.trim() !== "",
      )

      if (validLessons.length === 0) {
        throw new Error("At least one valid video lesson is required")
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail || "/placeholder.svg?height=200&width=300",
        videoLessons: validLessons,
        packages: selectedPackages,
      }

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create course")
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      })

      router.push("/admin/courses")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Course</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <div className="bg-white rounded-md shadow p-6">
            <div className="mb-6">
              <Label htmlFor="title" className="block mb-2">
                Course Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="description" className="block mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows={4}
                required
              />
            </div>

            <div className="mb-6">
              <CustomImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                folder="courses"
                label="Course Thumbnail"
                description="Upload course thumbnail image (recommended: 1280x720px)"
              />
            </div>
          </div>

          <div className="bg-white rounded-md shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Video Lessons</h2>
              <Button type="button" variant="outline" onClick={addVideoLesson} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Video
              </Button>
            </div>

            {videoLessons.map((lesson, index) => (
              <div key={index} className="border rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Video {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideoLesson(index)}
                    disabled={videoLessons.length === 1}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor={`video-title-${index}`} className="block mb-2">
                      Video Title
                    </Label>
                    <Input
                      id={`video-title-${index}`}
                      value={lesson.title}
                      onChange={(e) => handleVideoLessonChange(index, "title", e.target.value)}
                      placeholder="Enter video title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`video-url-${index}`} className="block mb-2">
                      Video URL
                    </Label>
                    <div className="relative">
                      <Input
                        id={`video-url-${index}`}
                        value={lesson.videoUrl}
                        onChange={(e) => handleVideoLessonChange(index, "videoUrl", e.target.value)}
                        placeholder="YouTube or Vimeo URL"
                        className="pl-9"
                        required
                      />
                      <Video className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`video-duration-${index}`} className="block mb-2">
                      Duration (minutes)
                    </Label>
                    <Input
                      id={`video-duration-${index}`}
                      type="number"
                      value={lesson.duration}
                      onChange={(e) => handleVideoLessonChange(index, "duration", e.target.value)}
                      placeholder="Enter duration"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-md shadow p-6">
            <h2 className="text-lg font-medium mb-4">Assign to Packages</h2>
            {isLoadingPackages ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <div className="h-5 w-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mr-2"></div>
                <span>Loading packages...</span>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-gray-500 mb-2">No packages found</p>
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/packages/create")}>
                  Create a Package First
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3">
                {packages.map((pkg) => (
                  <div key={pkg._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`package-${pkg._id}`}
                      checked={selectedPackages.includes(pkg._id)}
                      onCheckedChange={(checked) => handlePackageChange(pkg._id, checked as boolean)}
                    />
                    <Label htmlFor={`package-${pkg._id}`} className="font-normal">
                      {pkg.title}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
