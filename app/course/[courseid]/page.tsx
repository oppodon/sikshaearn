"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowRight, BookOpen, Clock, FileText, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import YouTubePlayer from "@/components/youtube-player"

interface Lesson {
  _id: string
  title: string
  description: string
  videoUrl: string
  duration: string
  resources?: {
    title: string
    url: string
    type: string
  }[]
}

interface Course {
  _id: string
  title: string
  description: string
  thumbnail: string
  videoLessons: Lesson[]
}

interface Enrollment {
  _id: string
  notes?: Record<string, string>
  progress: number
}

export default function CoursePage({ params }: { params: { courseid: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/course/${params.courseid}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to load course")
        }

        const data = await response.json()
        setCourse(data.course)
        setEnrollment(data.enrollment)

        // Set notes for the first lesson if available
        if (data.enrollment?.notes && data.course?.videoLessons?.length > 0) {
          const firstLessonId = data.course.videoLessons[0]._id
          setNotes(data.enrollment.notes[firstLessonId] || "")
        }
      } catch (error: any) {
        console.error("Error fetching course:", error)
        setError(error.message || "Failed to load course. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [params.courseid])

  const handleLessonChange = (index: number) => {
    // Save notes for current lesson before changing
    if (course && enrollment) {
      const currentLessonId = course.videoLessons[activeLesson]._id
      saveNotes(currentLessonId, notes)
    }

    setActiveLesson(index)

    // Load notes for the selected lesson
    if (course && enrollment?.notes) {
      const lessonId = course.videoLessons[index]._id
      setNotes(enrollment.notes[lessonId] || "")
    } else {
      setNotes("")
    }
  }

  const saveNotes = async (lessonId: string, noteContent: string) => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/course/${params.courseid}/save-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          notes: noteContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save notes")
      }

      const data = await response.json()
      setEnrollment(data.enrollment)

      toast({
        title: "Notes Saved",
        description: "Your notes have been saved successfully.",
      })
    } catch (error: any) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save notes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = () => {
    if (!course) return
    const lessonId = course.videoLessons[activeLesson]._id
    saveNotes(lessonId, notes)
  }

  const navigateToNextLesson = () => {
    if (course && activeLesson < course.videoLessons.length - 1) {
      handleLessonChange(activeLesson + 1)
    }
  }

  const navigateToPreviousLesson = () => {
    if (activeLesson > 0) {
      handleLessonChange(activeLesson - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-[480px] w-full rounded-lg" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/dashboard/my-courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Courses
        </Button>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load course. Please try again later.</AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/dashboard/my-courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Courses
        </Button>
      </div>
    )
  }

  const currentLesson = course.videoLessons[activeLesson]
  const progress = enrollment ? enrollment.progress || 0 : 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/my-courses")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
          <Progress value={progress} className="w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {currentLesson?.videoUrl ? (
              <YouTubePlayer videoUrl={currentLesson.videoUrl} width="100%" height="100%" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No video available for this lesson</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{currentLesson?.title}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={navigateToPreviousLesson} disabled={activeLesson === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToNextLesson}
                disabled={activeLesson === course.videoLessons.length - 1}
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              {currentLesson?.resources?.length > 0 && <TabsTrigger value="resources">Resources</TabsTrigger>}
            </TabsList>
            <TabsContent value="content" className="p-4 border rounded-md mt-2">
              <div className="prose max-w-none">
                <p>{currentLesson?.description || "No description available for this lesson."}</p>
              </div>
              <div className="mt-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Duration: {currentLesson?.duration || "N/A"}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="p-4 border rounded-md mt-2">
              <div className="space-y-4">
                <Textarea
                  placeholder="Take notes for this lesson..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={10}
                />
                <Button onClick={handleSaveNotes} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            {currentLesson?.resources?.length > 0 && (
              <TabsContent value="resources" className="p-4 border rounded-md mt-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Lesson Resources</h3>
                  <div className="grid gap-2">
                    {currentLesson.resources.map((resource, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-500" />
                            <span>{resource.title}</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Course Progress</h3>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">Progress: {progress}%</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Course Content</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {course.videoLessons.map((lesson, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-colors ${activeLesson === index ? "border-primary" : ""}`}
                  onClick={() => handleLessonChange(index)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          activeLesson === index ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <BookOpen className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
