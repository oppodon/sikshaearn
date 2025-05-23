import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Filter, Search } from "lucide-react"

export default function CoursesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-muted py-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore Our Courses</h1>
            <p className="text-muted-foreground md:text-xl max-w-[700px]">
              Discover top-quality courses to enhance your skills and advance your career
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-6 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search courses..." className="w-full pl-8" />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="marketing">Digital Marketing</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="video">Video Production</SelectItem>
                  <SelectItem value="personal">Personal Development</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="relative aspect-video">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {course.featured && <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{course.duration}</span>
                        </div>
                        <div className="font-medium">Rs. {course.price}</div>
                      </div>
                      <Button className="w-full mt-2" variant="outline">
                        Enroll Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const courses = [
  {
    id: 1,
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Master digital marketing strategies, SEO, social media, and analytics to grow your business online.",
    image: "/placeholder.svg?height=200&width=300",
    price: 1499,
    duration: "20 hours",
    featured: true,
  },
  {
    id: 2,
    title: "Communication Skill",
    slug: "communication-skill",
    description: "Develop effective communication skills for professional and personal success.",
    image: "/placeholder.svg?height=200&width=300",
    price: 899,
    duration: "12 hours",
    featured: false,
  },
  {
    id: 3,
    title: "Facebook Ads",
    slug: "facebook-ads",
    description: "Learn to create, optimize and scale Facebook ad campaigns for maximum ROI.",
    image: "/placeholder.svg?height=200&width=300",
    price: 1299,
    duration: "15 hours",
    featured: false,
  },
  {
    id: 4,
    title: "YouTube Mastery",
    slug: "youtube-mastery",
    description: "Learn how to create, grow, and monetize a successful YouTube channel from scratch.",
    image: "/placeholder.svg?height=200&width=300",
    price: 1599,
    duration: "18 hours",
    featured: false,
  },
  {
    id: 5,
    title: "Video Editing",
    slug: "video-editing",
    description: "Master video editing techniques using professional software to create stunning videos.",
    image: "/placeholder.svg?height=200&width=300",
    price: 1299,
    duration: "15 hours",
    featured: false,
  },
  {
    id: 6,
    title: "Personality Development",
    slug: "personality-development",
    description: "Enhance your personal and professional presence with effective personality development techniques.",
    image: "/placeholder.svg?height=200&width=300",
    price: 999,
    duration: "10 hours",
    featured: false,
  },
]
