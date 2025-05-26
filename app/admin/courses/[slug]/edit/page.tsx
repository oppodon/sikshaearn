"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash, Upload } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CourseData {
  _id: string
  title: string
  slug: string
  description: string
  longDescription: string
  price: number
  duration: string
  lessons: number
  thumbnail: string
  instructor: {
    name: string
    title: string
    bio: string
    avatar: string
  }
  category: string
  level: string
  tags: string[]
  status: string
  featured: boolean
  packages: string[]
  videoLessons: {
    title: string
    description: string
    videoUrl: string
    duration: string
    resources: {
      title: string
      type: string
      url: string
      size: string
    }[]
  }[]
}

interface Package {
  _id: string
  name: string
}

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null

  // Match YouTube URL patterns
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}

export default function EditCoursePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [courseId, setCourseId] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    price: "",
    duration: "",
    category: "",
    level: "beginner",
    status: "draft",
    featured: false,
    tags: [""],
  })

  const [videoLessons, setVideoLessons] = useState([
    {
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      resources: [{ title: "", type: "pdf", url: "", size: "" }],
    },
  ])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)

        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${params.slug}`)

        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course data")
        }

        const courseData = await courseResponse.json()
        const course = courseData.course

        if (!course) {
          throw new Error("Course not found")
        }

        setCourseId(course._id)

        // Set form data
        setFormData({
          title: course.title || "",
          description: course.description || "",
          longDescription: course.longDescription || "",
          price: course.price?.toString() || "",
          duration: course.duration || "",
          category: course.category || "",
          level: course.level || "beginner",
          status: course.status || "draft",
          featured: course.featured || false,
          tags: course.tags?.length ? course.tags : [""],
        })

        // Set video lessons
        if (course.videoLessons && course.videoLessons.length > 0) {
          setVideoLessons(course.videoLessons)
        }

        // Set selected packages
        if (course.packages && course.packages.length > 0) {
          setSelectedPackages(course.packages)
        }

        // Fetch packages
        const packagesResponse = await fetch("/api/packages")

        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json()
          setPackages(packagesData.packages || [])
        }
      } catch (error: any) {
        console.error("Error fetching course:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [params.slug, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags]
    newTags[index] = value
    setFormData((prev) => ({ ...prev, tags: newTags }))
  }

  const addTag = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }))
  }

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, tags: newTags.length ? newTags : [""] }))
  }

  const handleVideoLessonChange = (index: number, field: string, value: string) => {
    const newLessons = [...videoLessons]
    newLessons[index][field] = value
    setVideoLessons(newLessons)
  }

  const addVideoLesson = () => {
    setVideoLessons([
      ...videoLessons,
      {
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        resources: [{ title: "", type: "pdf", url: "", size: "" }],
      },
    ])
  }

  const removeVideoLesson = (index: number) => {
    const newLessons = videoLessons.filter((_, i) => i !== index)
    setVideoLessons(
      newLessons.length
        ? newLessons
        : [
            {
              title: "",
              description: "",
              videoUrl: "",
              duration: "",
              resources: [{ title: "", type: "pdf", url: "", size: "" }],
            },
          ],
    )
  }

  const handleResourceChange = (lessonIndex: number, resourceIndex: number, field: string, value: string) => {
    const newLessons = [...videoLessons]
    newLessons[lessonIndex].resources[resourceIndex][field] = value
    setVideoLessons(newLessons)
  }

  const addResource = (lessonIndex: number) => {
    const newLessons = [...videoLessons]
    newLessons[lessonIndex].resources.push({
      title: "",
      type: "pdf",
      url: "",
      size: "",
    })
    setVideoLessons(newLessons)
  }

  const removeResource = (lessonIndex: number, resourceIndex: number) => {
    const newLessons = [...videoLessons]
    newLessons[lessonIndex].resources = newLessons[lessonIndex].resources.filter((_, i) => i !== resourceIndex)

    // Ensure there's at least one resource
    if (newLessons[lessonIndex].resources.length === 0) {
      newLessons[lessonIndex].resources = [{ title: "", type: "pdf", url: "", size: "" }]
    }

    setVideoLessons(newLessons)
  }

  const togglePackage = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Filter out empty tags
      const filteredTags = formData.tags.filter((tag) => tag.trim() !== "")

      const courseData = {
        ...formData,
        price: Number.parseFloat(formData.price) || 0,
        tags: filteredTags,
        videoLessons,
        packages: selectedPackages,
      }

      // Send PATCH request to update the course
      const response = await fetch(`/api/courses/${params.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update course")
      }

      toast({
        title: "Success",
        description: "Course updated successfully",
      })

      router.push("/admin/courses")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/courses/${params.slug}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete course")
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      })

      router.push("/admin/courses")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteAlert(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Skeleton className="h-10 w-full max-w-md" />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === "published" ? "default" : "secondary"}>
            {formData.status === "published" ? "Published" : formData.status === "draft" ? "Draft" : "Archived"}
          </Badge>
          <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Course</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the course and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Edit the basic details of your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Digital Marketing Mastery"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the course"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Detailed Description</Label>
                  <Textarea
                    id="longDescription"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    placeholder="Comprehensive description of what the course covers"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 1499"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g. 20 hours"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Personal Development">Personal Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={formData.level} onValueChange={(value) => handleSelectChange("level", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="all-levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                    <Label htmlFor="featured">Featured Course</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => handleTagChange(index, e.target.value)}
                          placeholder="e.g. digital marketing"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeTag(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addTag} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tag
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Video Lessons</CardTitle>
                <CardDescription>Add video lessons and resources to your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {videoLessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="space-y-4 border p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Lesson {lessonIndex + 1}</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeVideoLesson(lessonIndex)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`lesson-${lessonIndex}-title`}>Lesson Title</Label>
                      <Input
                        id={`lesson-${lessonIndex}-title`}
                        value={lesson.title}
                        onChange={(e) => handleVideoLessonChange(lessonIndex, "title", e.target.value)}
                        placeholder="e.g. Introduction to Digital Marketing"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`lesson-${lessonIndex}-description`}>Lesson Description</Label>
                      <Textarea
                        id={`lesson-${lessonIndex}-description`}
                        value={lesson.description}
                        onChange={(e) => handleVideoLessonChange(lessonIndex, "description", e.target.value)}
                        placeholder="Brief description of this lesson"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`lesson-${lessonIndex}-videoUrl`}>Video URL (YouTube)</Label>
                      <Input
                        id={`lesson-${lessonIndex}-videoUrl`}
                        value={lesson.videoUrl}
                        onChange={(e) => handleVideoLessonChange(lessonIndex, "videoUrl", e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=example"
                      />
                      {lesson.videoUrl && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                          <div className="aspect-video bg-black/5 rounded-md flex items-center justify-center">
                            {getYouTubeVideoId(lesson.videoUrl) ? (
                              <iframe
                                className="w-full h-full rounded-md"
                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(lesson.videoUrl)}`}
                                title={lesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <p className="text-sm text-muted-foreground">Enter a valid YouTube URL to see preview</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`lesson-${lessonIndex}-duration`}>Duration</Label>
                      <Input
                        id={`lesson-${lessonIndex}-duration`}
                        value={lesson.duration}
                        onChange={(e) => handleVideoLessonChange(lessonIndex, "duration", e.target.value)}
                        placeholder="e.g. 15 min"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Resources</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => addResource(lessonIndex)}>
                          <Plus className="mr-2 h-3 w-3" />
                          Add Resource
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {lesson.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="border p-2 rounded-md space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium">Resource {resourceIndex + 1}</h5>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeResource(lessonIndex, resourceIndex)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label htmlFor={`resource-${lessonIndex}-${resourceIndex}-title`} className="text-xs">
                                  Title
                                </Label>
                                <Input
                                  id={`resource-${lessonIndex}-${resourceIndex}-title`}
                                  value={resource.title}
                                  onChange={(e) =>
                                    handleResourceChange(lessonIndex, resourceIndex, "title", e.target.value)
                                  }
                                  placeholder="e.g. Lesson Slides"
                                  className="h-8"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`resource-${lessonIndex}-${resourceIndex}-type`} className="text-xs">
                                  Type
                                </Label>
                                <Select
                                  value={resource.type}
                                  onValueChange={(value) =>
                                    handleResourceChange(lessonIndex, resourceIndex, "type", value)
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="doc">Document</SelectItem>
                                    <SelectItem value="ppt">Presentation</SelectItem>
                                    <SelectItem value="zip">ZIP Archive</SelectItem>
                                    <SelectItem value="link">External Link</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`resource-${lessonIndex}-${resourceIndex}-url`} className="text-xs">
                                  URL
                                </Label>
                                <Input
                                  id={`resource-${lessonIndex}-${resourceIndex}-url`}
                                  value={resource.url}
                                  onChange={(e) =>
                                    handleResourceChange(lessonIndex, resourceIndex, "url", e.target.value)
                                  }
                                  placeholder="e.g. /resources/slides.pdf"
                                  className="h-8"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`resource-${lessonIndex}-${resourceIndex}-size`} className="text-xs">
                                  Size
                                </Label>
                                <Input
                                  id={`resource-${lessonIndex}-${resourceIndex}-size`}
                                  value={resource.size}
                                  onChange={(e) =>
                                    handleResourceChange(lessonIndex, resourceIndex, "size", e.target.value)
                                  }
                                  placeholder="e.g. 2.4 MB"
                                  className="h-8"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addVideoLesson} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lesson
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Package Assignment</CardTitle>
                <CardDescription>Assign this course to packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the packages that should include this course. Customers who purchase these packages will have
                    access to this course.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-2">
                        No packages found. Please create packages first.
                      </p>
                    ) : (
                      packages.map((pkg) => (
                        <div key={pkg._id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`package-${pkg._id}`}
                            checked={selectedPackages.includes(pkg._id)}
                            onCheckedChange={() => togglePackage(pkg._id)}
                          />
                          <Label htmlFor={`package-${pkg._id}`} className="font-normal">
                            {pkg.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Media</CardTitle>
                <CardDescription>Upload course thumbnail and promotional media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Course Thumbnail</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <div className="mb-4 w-full max-w-xs aspect-video relative bg-muted rounded-md overflow-hidden">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="Course thumbnail"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                      <p className="text-xs text-muted-foreground mb-4">Recommended size: 1280x720px (16:9 ratio)</p>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructor Avatar</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <div className="mb-4 w-24 h-24 relative bg-muted rounded-full overflow-hidden">
                      <img src="/placeholder-user.jpg" alt="Instructor avatar" className="object-cover w-full h-full" />
                    </div>
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                      <p className="text-xs text-muted-foreground mb-4">Recommended size: 400x400px</p>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
