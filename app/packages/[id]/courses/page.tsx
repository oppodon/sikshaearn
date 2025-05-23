import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, FileText, Star, ArrowLeft, BookOpen } from "lucide-react"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course"
import { ObjectId } from "mongodb"

async function getPackageCourses(id: string) {
  await connectToDatabase()

  try {
    // Validate if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return { package: null, courses: [] }
    }

    // Find package by ID
    const packageData = await Package.findById(id).lean()

    if (!packageData) {
      return { package: null, courses: [] }
    }

    // Get courses included in the package
    let courses = []
    if (packageData.courses && packageData.courses.length > 0) {
      courses = await Course.find({ _id: { $in: packageData.courses } })
        .select("title slug description thumbnail instructor duration lessons rating reviewCount")
        .lean()
    } else {
      // If no specific courses are assigned, get courses based on count
      courses = await Course.find({})
        .limit(packageData.courseCount || 0)
        .select("title slug description thumbnail instructor duration lessons rating reviewCount")
        .lean()
    }

    return { package: packageData, courses }
  } catch (error) {
    console.error("Error fetching package courses:", error)
    return { package: null, courses: [] }
  }
}

export default async function PackageCoursesPage({ params }: { params: { id: string } }) {
  const { package: packageData, courses } = await getPackageCourses(params.id)

  if (!packageData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The package you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/packages">Browse Packages</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/packages/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/packages" className="text-sm text-muted-foreground hover:text-primary">
            Packages
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <Link href={`/packages/${params.id}`} className="text-sm text-muted-foreground hover:text-primary">
            {packageData.title || packageData.name}
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm">Courses</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{packageData.title || packageData.name}: Included Courses</h1>
        <p className="text-muted-foreground">
          Browse all courses included in the {packageData.title || packageData.name} package.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course._id.toString()} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                  <Image
                    src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 md:w-2/3">
                  <h3 className="font-semibold text-xl mb-2">{course.title}</h3>
                  <p className="text-muted-foreground mb-4">{course.description}</p>

                  <div className="flex flex-wrap items-center text-sm mb-4 gap-y-2">
                    <div className="flex items-center mr-4">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                      <span>{course.rating || 4.5}</span>
                      <span className="text-muted-foreground ml-1">({course.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>{course.duration || "10 hours"}</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-muted-foreground">
                        Instructor: <span className="font-medium">{course.instructor?.name || "Instructor Name"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button asChild>
                      <Link href={`/courses/${course._id.toString()}`}>View Course</Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Courses Available</h2>
            <p className="text-muted-foreground mb-6">
              There are currently no courses available in this package. Please check back later.
            </p>
            <Button asChild>
              <Link href={`/packages/${params.id}`}>Back to Package Details</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href={`/packages/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Package Details
          </Link>
        </Button>
      </div>
    </div>
  )
}
