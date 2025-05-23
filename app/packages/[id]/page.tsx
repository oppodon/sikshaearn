import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  Clock,
  FileText,
  Users,
  Calendar,
  Award,
  MessageSquare,
  Star,
  ShoppingCart,
  BookOpen,
  ArrowRight,
  Layers,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course"
import mongoose from "mongoose"

// Fetch package data from database
async function getPackageData(id: string) {
  await connectToDatabase()

  try {
    // Initialize Course model to ensure it's registered
    await Course.findOne().limit(1)

    // Check if id is a valid ObjectId or slug
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }

    // Find package by ID or slug
    const packageData = await Package.findOne(query)
      .populate({
        path: "courses",
        select: "title slug description thumbnail instructor duration lessons rating reviewCount",
      })
      .lean()

    if (!packageData) {
      return null
    }

    return packageData
  } catch (error) {
    console.error("Error fetching package data:", error)
    return null
  }
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const packageData = await getPackageData(params.id)

  if (!packageData) {
    notFound()
  }

  return (
    <div className="container py-12 px-4 mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Link href="/packages" className="text-sm text-muted-foreground hover:text-primary">
            Packages
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm">{packageData.title}</span>
        </div>

        <div className="relative rounded-xl overflow-hidden mb-6">
          <div className="relative h-[300px] w-full">
            <Image
              src={packageData.thumbnail || "/placeholder.svg?height=400&width=800"}
              alt={packageData.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
              <div className="flex items-center gap-2 mb-2">
                {packageData.isPopular && <Badge className="bg-primary">MOST POPULAR</Badge>}
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {packageData.courses?.length || 0} Courses
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {packageData.studentCount || 0}+ Students
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{packageData.title}</h1>
              <p className="text-xl text-white/80 mt-2 max-w-3xl">{packageData.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">About This Package</h2>
                <p className="text-muted-foreground">{packageData.longDescription || packageData.description}</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">What's Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-2xl">{packageData.courses?.length || 0} Premium Courses</p>
                      <p className="text-sm text-muted-foreground">Comprehensive curriculum</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-2xl">
                        {packageData.accessDuration || 12} {packageData.accessDuration === null ? "Lifetime" : "Months"}
                      </p>
                      <p className="text-sm text-muted-foreground">Access period</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary" />
                        Certificate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-2xl">{packageData.hasCertificate ? "Included" : "Not Included"}</p>
                      <p className="text-sm text-muted-foreground">For all completed courses</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-2xl">
                        {packageData.supportLevel?.charAt(0).toUpperCase() + packageData.supportLevel?.slice(1) ||
                          "Email"}
                      </p>
                      <p className="text-sm text-muted-foreground">Technical and content support</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Key Benefits</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {packageData.benefits && Array.isArray(packageData.benefits) && packageData.benefits.length > 0 ? (
                    packageData.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))
                  ) : Array.isArray(packageData.features) && packageData.features.length > 0 ? (
                    packageData.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Access to premium course content</span>
                    </li>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Courses Included</h2>
                  <Button asChild variant="outline">
                    <Link href={`/packages/${params.id}/courses`}>
                      <Layers className="mr-2 h-4 w-4" />
                      View All Courses
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {packageData.courses && packageData.courses.length > 0 ? (
                    packageData.courses.slice(0, 3).map((course) => (
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

                            <div className="flex items-center text-sm mb-4">
                              <div className="flex items-center mr-4">
                                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                                <span>{course.rating || 4.5}</span>
                                <span className="text-muted-foreground ml-1">({course.reviewCount || 0} reviews)</span>
                              </div>
                              <div className="flex items-center mr-4">
                                <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                <span>{course.duration || "10 hours"}</span>
                              </div>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                                <span>{course.lessons?.length || 0} lessons</span>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div className="text-sm">
                                Instructor:{" "}
                                <span className="font-medium">{course.instructor || "Instructor Name"}</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/courses/${course.slug || course._id.toString()}`}>
                                  View Course Details
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No courses available for this package yet.</p>
                    </div>
                  )}
                </div>

                {packageData.courses && packageData.courses.length > 3 && (
                  <div className="flex justify-center mt-4">
                    <Button asChild variant="outline">
                      <Link href={`/packages/${params.id}/courses`}>
                        View All {packageData.courses.length} Courses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {packageData.faqs && Array.isArray(packageData.faqs) && packageData.faqs.length > 0 ? (
                    packageData.faqs.map((faq, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">How long do I have access to the courses?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            You will have access to all courses in this package for
                            {packageData.accessDuration === null
                              ? " lifetime"
                              : ` ${packageData.accessDuration || 12} months`}
                            from the date of purchase.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Can I download the course materials?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            Yes, you can download all course materials, including PDFs, worksheets, and resources for
                            offline use.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Is there a certificate upon completion?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            {packageData.hasCertificate
                              ? "Yes, you will receive a certificate of completion for each course you finish in the package."
                              : "No, this package does not include certificates of completion."}
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold">₹{packageData.price}</CardTitle>
                {packageData.originalPrice && (
                  <span className="text-muted-foreground line-through">₹{packageData.originalPrice}</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {packageData.originalPrice
                  ? Math.round(((packageData.originalPrice - packageData.price) / packageData.originalPrice) * 100)
                  : 0}
                % off • Limited time offer
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href={`/packages/${packageData._id.toString()}/checkout`}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{packageData.studentCount || 0}+ students enrolled</span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">This package includes:</h3>
                <ul className="space-y-2">
                  {Array.isArray(packageData.features) && packageData.features.length > 0 ? (
                    packageData.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Access to all courses in this package</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t pt-4 text-sm">
                <p>Not sure if this is right for you?</p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/contact">Contact us for guidance</Link>
                </Button>
              </div>

              <div className="border-t pt-4 flex items-center justify-center gap-2 text-sm">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/packages">Compare All Packages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
