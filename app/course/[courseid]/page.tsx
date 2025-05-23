"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  Lock,
  FileText,
  MessageSquare,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Save,
} from "lucide-react"
import YouTubePlayer from "@/components/youtube-player"

interface Lesson {
  _id: string
  title: string
  videoUrl: string
  duration: number
  isLocked?: boolean
}

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  thumbnail: string
  videoLessons: Lesson[]
  totalDuration: number
  completedLessons: string[]
  currentLesson: string
  progress: number
  enrolledAt: string
  lastAccessed: string
}

export default function CoursePlayerPage({ params }: { params: { courseid: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    const fetchCourse = async () => {
      if (status === "loading") return
      if (!session?.user) {
        router.push("/login")
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/course/${params.courseid}`)

        if (!response.ok) {
          if (response.status === 403) {
            router.push("/dashboard/my-courses")
            return
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setCourse(data.course)
        setNotes(data.notes || {})

        // Set current lesson
        if (data.course.videoLessons && data.course.videoLessons.length > 0) {
          const currentLessonId = data.course.currentLesson || data.course.videoLessons[0]._id
          const lesson = data.course.videoLessons.find((l: Lesson) => l._id === currentLessonId)
          setCurrentLesson(lesson || data.course.videoLessons[0])
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        setError("Failed to load course. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [session, status, params.courseid, router])

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.isLocked) {
      return
    }
    setCurrentLesson(lesson)
  }

  const handleLessonComplete = async () => {
    if (!currentLesson || !course) return

    try {
      const response = await fetch(`/api/course/${course.id}/complete-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId: currentLesson._id }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark lesson as complete")
      }

      const data = await response.json()

      // Update course with new progress and completed lessons
      setCourse({
        ...course,
        progress: data.progress,
        completedLessons: data.completedLessons,
      })

      // Update lessons lock status
      if (course.videoLessons) {
        const updatedLessons = course.videoLessons.map((lesson, index) => {
          if (index === 0) return { ...lesson, isLocked: false }

          const previousLesson = course.videoLessons[index - 1]
          const isPreviousLessonCompleted = data.completedLessons.includes(previousLesson._id)

          return { ...lesson, isLocked: !isPreviousLessonCompleted }
        })

        setCourse({
          ...course,
          videoLessons: updatedLessons,
          progress: data.progress,
          completedLessons: data.completedLessons,
        })
      }
    } catch (error) {
      console.error("Error completing lesson:", error)
    }
  }

  const handleSaveNotes = async () => {
    if (!currentLesson || !course) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/course/${course.id}/save-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: currentLesson._id,
          notes: notes[currentLesson._id] || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save notes")
      }
    } catch (error) {
      console.error("Error saving notes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNoteChange = (value: string) => {
    if (!currentLesson) return
    setNotes({
      ...notes,
      [currentLesson._id]: value,
    })
  }

  const navigateToNextLesson = () => {
    if (!course || !currentLesson) return

    const currentIndex = course.videoLessons.findIndex((lesson) => lesson._id === currentLesson._id)
    if (currentIndex < course.videoLessons.length - 1) {
      const nextLesson = course.videoLessons[currentIndex + 1]
      if (!nextLesson.isLocked) {
        setCurrentLesson(nextLesson)
      }
    }
  }

  const navigateToPreviousLesson = () => {
    if (!course || !currentLesson) return

    const currentIndex = course.videoLessons.findIndex((lesson) => lesson._id === currentLesson._id)
    if (currentIndex > 0) {
      setCurrentLesson(course.videoLessons[currentIndex - 1])
    }
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to load course. Please try again later."}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/my-courses")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to My Courses
          </Button>
        </div>
      </div>
    )
  }

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Calculate current lesson index
  const currentLessonIndex = currentLesson
    ? course.videoLessons.findIndex((lesson) => lesson._id === currentLesson._id)
    : -1

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content area */}
        <div className="lg:w-2/3 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/my-courses")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to My Courses
              </Button>
              <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Clock className="mr-1 h-3 w-3" />
                {formatDuration(course.totalDuration)}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <BookOpen className="mr-1 h-3 w-3" />
                {course.videoLessons.length} lessons
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                {course.progress}% Complete
              </Badge>
            </div>
          </div>

          {/* Video player */}
          {currentLesson && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <YouTubePlayer videoUrl={currentLesson.videoUrl} />
            </div>
          )}

          {/* Lesson navigation */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={navigateToPreviousLesson} disabled={currentLessonIndex <= 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>
            <Button
              variant="default"
              onClick={handleLessonComplete}
              disabled={!currentLesson || course.completedLessons.includes(currentLesson._id)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {course.completedLessons.includes(currentLesson?._id || "") ? "Completed" : "Mark as Complete"}
            </Button>
            <Button
              variant="outline"
              onClick={navigateToNextLesson}
              disabled={
                currentLessonIndex === -1 ||
                currentLessonIndex >= course.videoLessons.length - 1 ||
                (currentLessonIndex < course.videoLessons.length - 1 &&
                  course.videoLessons[currentLessonIndex + 1].isLocked)
              }
            >
              Next Lesson
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Lesson details */}
          <div>
            <h2 className="text-xl font-semibold">{currentLesson?.title}</h2>
            <p className="text-muted-foreground mt-1">
              Lesson {currentLessonIndex + 1} of {course.videoLessons.length} •{" "}
              {formatDuration(currentLesson?.duration || 0)}
            </p>
          </div>

          {/* Tabs for content, notes, discussion */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="notes">
                <BookOpen className="h-4 w-4 mr-2" />
                My Notes
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              <div className="prose max-w-none">
                <p>{currentLesson?.title}</p>
                <p className="text-muted-foreground">
                  This lesson covers the key concepts and practical applications of the topic. Follow along with the
                  video and complete the exercises to master the material.
                </p>
                <h3>Resources</h3>
                <ul>
                  <li>
                    <Button variant="link" className="p-0 h-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Lesson slides
                    </Button>
                  </li>
                  <li>
                    <Button variant="link" className="p-0 h-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Exercise files
                    </Button>
                  </li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Take notes for this lesson..."
                  className="min-h-[200px]"
                  value={notes[currentLesson?._id || ""] || ""}
                  onChange={(e) => handleNoteChange(e.target.value)}
                />
                <Button onClick={handleSaveNotes} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="discussion" className="mt-4">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Discussion</h3>
                <p className="mt-1 text-sm text-gray-500">Discussion forum will be available soon. Check back later!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Course Progress</h2>
                  <div className="flex justify-between text-sm mt-2">
                    <span>{course.progress}% complete</span>
                    <span>
                      {course.completedLessons.length}/{course.videoLessons.length} lessons
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2 mt-1" />
                </div>

                <Separator />

                <div>
                  <h2 className="text-lg font-semibold mb-2">Course Content</h2>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-2">
                      {course.videoLessons.map((lesson, index) => {
                        const isCompleted = course.completedLessons.includes(lesson._id)
                        const isActive = currentLesson?._id === lesson._id

                        return (
                          <div
                            key={lesson._id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleLessonClick(lesson)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : lesson.isLocked ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <Play className="h-5 w-5 text-blue-500" />
                                  )}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${lesson.isLocked ? "text-gray-400" : ""}`}>
                                    {index + 1}. {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${lesson.isLocked ? "text-gray-400" : ""}`}
                                    >
                                      <Clock className="mr-1 h-3 w-3" />
                                      {formatDuration(lesson.duration)}
                                    </Badge>
                                    {isCompleted && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                                    )}
                                    {lesson.isLocked && (
                                      <Badge variant="outline" className="text-xs">
                                        Locked
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
