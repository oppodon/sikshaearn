"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, FileText, Play, Star, Users } from "lucide-react"

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // In a real app, you would fetch the course data based on the slug
  const course = courses.find((c) => c.slug === params.slug) || courses[0]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Course Header */}
      <section className="bg-muted py-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {course.category}
                </Badge>
                {course.featured && <Badge className="bg-primary">Featured</Badge>}
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">{course.title}</h1>
              <p className="text-muted-foreground md:text-lg">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>
                    {course.rating} ({course.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 lg:w-1/4 flex flex-col gap-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="text-3xl font-bold">Rs. {course.price}</div>
                  <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Buy Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Complete Your Purchase</DialogTitle>
                        <DialogDescription>You're about to purchase {course.title}</DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-4 py-4 border-b">
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.duration}</p>
                        </div>
                        <div className="ml-auto font-medium">Rs. {course.price}</div>
                      </div>
                      <div className="py-4">
                        <Button className="w-full" asChild>
                          <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="w-full">
                    Add to Wishlist
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <p>This course includes:</p>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Downloadable resources</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructor"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                  >
                    Instructor
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">About This Course</h3>
                      <p className="text-muted-foreground">{course.longDescription}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">What You'll Learn</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.learningOutcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="curriculum" className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Course Content</h3>
                    <p className="text-muted-foreground">
                      {course.lessons} lessons • {course.duration} total
                    </p>
                    <div className="space-y-3">
                      {course.modules.map((module, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="font-medium mb-2">{module.title}</div>
                            <div className="text-sm text-muted-foreground mb-3">
                              {module.lessons.length} lessons • {module.duration}
                            </div>
                            <ul className="space-y-2">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <li
                                  key={lessonIndex}
                                  className="flex items-center justify-between text-sm py-1 border-t"
                                >
                                  <div className="flex items-center gap-2">
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                    <span>{lesson.title}</span>
                                  </div>
                                  <span className="text-muted-foreground">{lesson.duration}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="instructor" className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden">
                        <Image src="/placeholder-user.jpg" alt={course.instructor.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{course.instructor.name}</h3>
                        <p className="text-muted-foreground">{course.instructor.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{course.instructor.rating} Instructor Rating</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.instructor.students} Students</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Play className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.instructor.courses} Courses</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{course.instructor.bio}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">{course.rating}</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= Math.floor(course.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">({course.reviews} reviews)</span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">Course Rating</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {course.reviewsList.map((review, index) => (
                        <div key={index} className="border-t pt-4">
                          <div className="flex items-start gap-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                              <Image src="/placeholder-user.jpg" alt={review.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{review.name}</h4>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="mt-2 text-muted-foreground">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const courses = [
  {
    id: 1,
    title: "Digital Marketing Mastery",
    slug: "digital-marketing",
    description: "Master digital marketing strategies, SEO, social media, and analytics to grow your business online.",
    longDescription:
      "This comprehensive digital marketing course covers everything you need to know to succeed in the digital world. From SEO and content marketing to social media strategies and analytics, you'll learn practical skills that you can apply immediately. Whether you're a business owner, marketing professional, or just starting your career, this course will equip you with the tools and knowledge to create effective digital marketing campaigns.",
    image: "/placeholder.svg?height=200&width=300",
    price: 1499,
    duration: "20 hours",
    lessons: 42,
    students: 1250,
    rating: 4.8,
    reviews: 156,
    featured: true,
    category: "Marketing",
    learningOutcomes: [
      "Create comprehensive digital marketing strategies",
      "Optimize websites for search engines (SEO)",
      "Build effective social media marketing campaigns",
      "Analyze marketing data to improve performance",
      "Create compelling content that drives engagement",
      "Implement email marketing campaigns",
      "Understand digital advertising platforms",
      "Measure ROI of marketing activities",
    ],
    requirements: [
      "Basic computer skills",
      "No prior marketing experience required",
      "Willingness to learn and apply new concepts",
    ],
    modules: [
      {
        title: "Introduction to Digital Marketing",
        duration: "2 hours",
        lessons: [
          { title: "What is Digital Marketing?", duration: "15 min" },
          { title: "The Digital Marketing Landscape", duration: "20 min" },
          { title: "Setting Marketing Goals", duration: "25 min" },
          { title: "Understanding Your Target Audience", duration: "30 min" },
          { title: "Creating a Digital Marketing Strategy", duration: "30 min" },
        ],
      },
      {
        title: "Search Engine Optimization (SEO)",
        duration: "4 hours",
        lessons: [
          { title: "SEO Fundamentals", duration: "25 min" },
          { title: "Keyword Research", duration: "35 min" },
          { title: "On-Page SEO Techniques", duration: "40 min" },
          { title: "Off-Page SEO Strategies", duration: "30 min" },
          { title: "Technical SEO", duration: "45 min" },
          { title: "SEO Analytics and Reporting", duration: "35 min" },
        ],
      },
      {
        title: "Social Media Marketing",
        duration: "3.5 hours",
        lessons: [
          { title: "Social Media Strategy", duration: "30 min" },
          { title: "Facebook Marketing", duration: "45 min" },
          { title: "Instagram Marketing", duration: "40 min" },
          { title: "Twitter Marketing", duration: "30 min" },
          { title: "LinkedIn Marketing", duration: "35 min" },
          { title: "Social Media Analytics", duration: "30 min" },
        ],
      },
    ],
    instructor: {
      name: "Rajesh Sharma",
      title: "Digital Marketing Expert",
      bio: "Rajesh has over 10 years of experience in digital marketing, having worked with major brands and startups. He specializes in SEO, content marketing, and social media strategy. His practical approach to teaching has helped thousands of students launch successful marketing careers.",
      rating: 4.9,
      students: 5600,
      courses: 8,
    },
    reviewsList: [
      {
        name: "Aarav Patel",
        rating: 5,
        date: "2 months ago",
        comment:
          "This course exceeded my expectations! The instructor explains complex concepts in a simple way, and the practical exercises helped me apply what I learned immediately.",
      },
      {
        name: "Priya Singh",
        rating: 4,
        date: "3 months ago",
        comment:
          "Very comprehensive course with lots of practical examples. I've already seen improvements in my website's traffic after implementing the SEO techniques.",
      },
      {
        name: "Vikram Joshi",
        rating: 5,
        date: "1 month ago",
        comment:
          "The best digital marketing course I've taken. The instructor is knowledgeable and engaging, and the content is up-to-date with the latest trends.",
      },
    ],
  },
  {
    id: 2,
    title: "Communication Skills",
    slug: "communication-skill",
    description: "Develop effective communication skills for professional and personal success.",
    longDescription:
      "Effective communication is essential in both professional and personal settings. This course will help you develop strong verbal and non-verbal communication skills, improve your listening abilities, and build confidence in public speaking. You'll learn practical techniques for clear and persuasive communication that will help you advance in your career and improve your relationships.",
    image: "/placeholder.svg?height=200&width=300",
    price: 899,
    duration: "12 hours",
    lessons: 28,
    students: 2100,
    rating: 4.7,
    reviews: 210,
    featured: false,
    category: "Personal Development",
    learningOutcomes: [
      "Communicate clearly and confidently in professional settings",
      "Improve your listening skills and empathy",
      "Develop persuasive speaking and presentation skills",
      "Understand and use non-verbal communication effectively",
      "Handle difficult conversations with confidence",
      "Adapt your communication style to different audiences",
      "Write clear and effective emails and business documents",
      "Build rapport and connect with others",
    ],
    requirements: ["No prior experience required", "Open mind and willingness to practice"],
    modules: [
      {
        title: "Fundamentals of Communication",
        duration: "2.5 hours",
        lessons: [
          { title: "Understanding the Communication Process", duration: "20 min" },
          { title: "Barriers to Effective Communication", duration: "25 min" },
          { title: "Communication Styles and Preferences", duration: "30 min" },
          { title: "Active Listening Techniques", duration: "35 min" },
          { title: "Empathy in Communication", duration: "30 min" },
        ],
      },
      {
        title: "Verbal Communication Skills",
        duration: "3 hours",
        lessons: [
          { title: "Clear and Concise Speaking", duration: "25 min" },
          { title: "Voice Modulation and Tone", duration: "30 min" },
          { title: "Persuasive Speaking Techniques", duration: "35 min" },
          { title: "Storytelling in Communication", duration: "40 min" },
          { title: "Handling Questions and Objections", duration: "30 min" },
        ],
      },
      {
        title: "Non-Verbal Communication",
        duration: "2 hours",
        lessons: [
          { title: "Body Language Basics", duration: "25 min" },
          { title: "Facial Expressions and Eye Contact", duration: "20 min" },
          { title: "Gestures and Posture", duration: "25 min" },
          { title: "Space and Distance in Communication", duration: "20 min" },
          { title: "Reading Others' Non-Verbal Cues", duration: "30 min" },
        ],
      },
    ],
    instructor: {
      name: "Anita Desai",
      title: "Communication Coach",
      bio: "Anita is a certified communication coach with over 15 years of experience training professionals across industries. She has helped executives, managers, and teams improve their communication effectiveness and achieve better results. Her approach combines theory with practical exercises that you can apply immediately.",
      rating: 4.8,
      students: 7800,
      courses: 5,
    },
    reviewsList: [
      {
        name: "Rahul Mehta",
        rating: 5,
        date: "1 month ago",
        comment:
          "This course transformed how I communicate at work. I'm now more confident in meetings and presentations, and my colleagues have noticed the difference.",
      },
      {
        name: "Neha Gupta",
        rating: 4,
        date: "2 months ago",
        comment:
          "Very practical course with exercises that helped me improve my communication skills. The section on non-verbal communication was particularly insightful.",
      },
      {
        name: "Sanjay Kumar",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "Anita is an excellent instructor who explains concepts clearly and provides valuable feedback. This course has helped me become a better listener and communicator.",
      },
    ],
  },
]
