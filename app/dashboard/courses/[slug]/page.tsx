import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Clock,
  FileText,
  CheckCircle,
  User,
  Calendar,
  PlayCircle,
  Download,
  MessageSquare,
  BookmarkPlus,
  Star,
  ChevronLeft,
  ChevronRight,
  PenLine,
  Save,
} from "lucide-react"
import { YoutubePlayer } from "@/components/youtube-player"

async function getCourseData(slug: string, userId: string) {
  await connectToDatabase()

  // Find course by slug
  const course = await Course.findOne({ slug }).lean()

  if (!course) {
    return null
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: course._id,
  }).lean()

  if (!enrollment) {
    // User is not enrolled, redirect to course details page
    redirect(`/courses/${slug}`)
  }

  // Get current lesson
  const currentLessonId = enrollment.currentLesson || course.modules[0]?.lessons[0]?._id || null

  // Find current module and lesson
  let currentModule = null
  let currentLesson = null
  let currentLessonIndex = 0
  let currentModuleIndex = 0

  course.modules.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      if (lesson._id.toString() === currentLessonId?.toString()) {
        currentModule = module
        currentLesson = lesson
        currentLessonIndex = lessonIndex
        currentModuleIndex = moduleIndex
      }
    })
  })

  // Calculate progress
  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const completedLessons = enrollment.completedLessons?.length || 0
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Calculate next and previous lessons
  let nextLesson = null
  let prevLesson = null
  let nextModule = null
  let prevModule = null

  if (currentModule && currentLesson) {
    // Check if there's another lesson in the current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      nextLesson = currentModule.lessons[currentLessonIndex + 1]
      nextModule = currentModule
    } else if (currentModuleIndex < course.modules.length - 1) {
      // Move to the first lesson of the next module
      nextModule = course.modules[currentModuleIndex + 1]
      nextLesson = nextModule.lessons[0]
    }

    // Check if there's a previous lesson in the current module
    if (currentLessonIndex > 0) {
      prevLesson = currentModule.lessons[currentLessonIndex - 1]
      prevModule = currentModule
    } else if (currentModuleIndex > 0) {
      // Move to the last lesson of the previous module
      prevModule = course.modules[currentModuleIndex - 1]
      prevLesson = prevModule.lessons[prevModule.lessons.length - 1]
    }
  }

  return {
    course,
    enrollment,
    currentModule,
    currentLesson,
    progress,
    completedLessons: enrollment.completedLessons || [],
    notes: enrollment.notes || {},
    nextLesson,
    prevLesson,
    nextModule,
    prevModule,
  }
}

export default async function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=" + encodeURIComponent(`/dashboard/courses/${params.slug}`))
  }

  const data = await getCourseData(params.slug, session.user.id)

  if (!data) {
    notFound()
  }

  const {
    course,
    enrollment,
    currentModule,
    currentLesson,
    progress,
    completedLessons,
    notes,
    nextLesson,
    prevLesson,
    nextModule,
    prevModule,
  } = data

  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = currentLesson ? getYoutubeId(currentLesson.videoUrl) : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link href="/dashboard/my-courses" className="text-sm text-muted-foreground hover:text-primary">
          My Courses
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <Link href={`/courses/${params.slug}`} className="text-sm text-muted-foreground hover:text-primary">
          {course.title}
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">
          {currentModule?.title} / {currentLesson?.title}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
            {videoId ? (
              <YoutubePlayer videoId={videoId} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Video not available</p>
              </div>
            )}
          </div>

          {/* Lesson Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" disabled={!prevLesson} asChild={!!prevLesson}>
              {prevLesson ? (
                <Link href={`/dashboard/courses/${params.slug}?lessonId=${prevLesson._id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </>
              )}
            </Button>

            <Button variant="outline" disabled={!nextLesson} asChild={!!nextLesson}>
              {nextLesson ? (
                <Link href={`/dashboard/courses/${params.slug}?lessonId=${nextLesson._id}`}>
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <>
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Lesson Content */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6 pt-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{currentLesson?.duration} min</span>
                  </div>
                  {completedLessons.includes(currentLesson?._id.toString()) ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  ) : (
                    <form action="/api/courses/[slug]/lessons/[lessonId]/complete" method="POST">
                      <input type="hidden" name="courseId" value={course._id} />
                      <input type="hidden" name="lessonId" value={currentLesson?._id} />
                      <Button type="submit" variant="outline" size="sm" className="h-7">
                        <CheckCircle className="h-3 w-3 mr-1" /> Mark as Complete
                      </Button>
                    </form>
                  )}
                </div>
                <p className="text-muted-foreground whitespace-pre-line">{currentLesson?.description}</p>
              </div>

              {/* Resources */}
              {currentLesson?.resources && currentLesson.resources.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Resources</h2>
                  <div className="space-y-3">
                    {currentLesson.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-primary" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {resource.type} {resource.size && `• ${resource.size}`}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 pt-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Notes</h2>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" /> Save Notes
                  </Button>
                </div>
                <div className="bg-muted/40 rounded-md p-4">
                  <div className="flex items-center mb-2 text-sm text-muted-foreground">
                    <PenLine className="h-4 w-4 mr-1" />
                    <span>Notes for: {currentLesson?.title}</span>
                  </div>
                  <Textarea
                    placeholder="Type your notes here..."
                    className="min-h-[200px]"
                    defaultValue={notes[currentLesson?._id.toString()] || ""}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-6 pt-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Discussion</h2>
                <div className="bg-muted/40 rounded-md p-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Discuss this lesson with fellow students and ask questions.
                  </p>
                  <Button>Start Discussion</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{completedLessons.length}</span> of{" "}
                  {course.modules.reduce((sum, module) => sum + module.lessons.length, 0)} lessons completed
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/my-courses">View All My Courses</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent className="px-0 py-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border-b last:border-b-0">
                      <div className="px-6 py-3 bg-muted/30">
                        <h3 className="font-medium">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {module.lessons.length} lessons •{" "}
                          {module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)} min
                        </p>
                      </div>
                      <div>
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isActive = currentLesson?._id.toString() === lesson._id.toString()
                          const isCompleted = completedLessons.includes(lesson._id.toString())

                          return (
                            <Link
                              key={lessonIndex}
                              href={`/dashboard/courses/${params.slug}?lessonId=${lesson._id}`}
                              className={`flex items-center px-6 py-3 hover:bg-muted/50 ${isActive ? "bg-primary/10" : ""}`}
                            >
                              <div className="mr-3 flex-shrink-0">
                                {isCompleted ? (
                                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                  </div>
                                ) : isActive ? (
                                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                    <PlayCircle className="h-4 w-4 text-white" />
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                                    <span className="text-xs">{lessonIndex + 1}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className={`truncate ${isActive ? "font-medium" : ""}`}>{lesson.title}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{lesson.duration} min</span>
                                </div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About This Course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    Instructor: <span className="font-medium">{course.instructor}</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{course.modules.reduce((sum, module) => sum + module.lessons.length, 0)} Lessons</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    {course.modules.reduce(
                      (sum, module) => sum + module.lessons.reduce((s, l) => s + l.duration, 0),
                      0,
                    )}{" "}
                    minutes total
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <Button variant="ghost" size="sm">
                    <Star className="h-4 w-4 mr-1" /> Rate Course
                  </Button>
                  <Button variant="ghost" size="sm">
                    <BookmarkPlus className="h-4 w-4 mr-1" /> Bookmark
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
