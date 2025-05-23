import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, FileText, Users, Calendar, Award, Star, ShoppingCart, BookOpen } from "lucide-react"
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
    <div className="container py-10 px-4 mx-auto max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/packages"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Packages
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium">{packageData.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={packageData.thumbnail || "/placeholder.svg?height=400&width=800"}
                alt={packageData.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-3">{packageData.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{packageData.description}</p>

            <div className="flex flex-wrap gap-3 mt-4">
              {packageData.isPopular && (
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  MOST POPULAR
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {packageData.courses?.length || 0} Courses
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {packageData.studentCount || 0}+ Students
              </Badge>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <Card className="sticky top-8 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold">₹{packageData.price}</h2>
                {packageData.originalPrice && (
                  <span className="text-white/80 line-through">₹{packageData.originalPrice}</span>
                )}
              </div>
              {packageData.originalPrice && (
                <div className="inline-block bg-white/20 text-white rounded-full px-3 py-1 text-sm">
                  {Math.round(((packageData.originalPrice - packageData.price) / packageData.originalPrice) * 100)}% off
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              <Button
                asChild
                className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Link href={`/packages/${packageData._id.toString()}/checkout`}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Link>
              </Button>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">This package includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Full Access</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {packageData.courses?.length || 0} premium courses
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Duration</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {packageData.accessDuration === 0 ? "Lifetime" : `${packageData.accessDuration} months`} access
                      </p>
                    </div>
                  </li>
                  {packageData.hasCertificate && (
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Certificate</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completion certificate included</p>
                      </div>
                    </li>
                  )}
                  {packageData.supportLevel && (
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Support</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {packageData.supportLevel.charAt(0).toUpperCase() + packageData.supportLevel.slice(1)} support
                          included
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm pt-4 border-t">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">{packageData.studentCount || 0}+ students enrolled</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">About This Package</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>{packageData.longDescription || packageData.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">What You'll Get</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-0">
                <CardContent className="p-6">
                  <BookOpen className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-1">Courses</h3>
                  <p className="text-gray-600 dark:text-gray-300">{packageData.courses?.length || 0} Premium Courses</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-0">
                <CardContent className="p-6">
                  <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-1">Duration</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {packageData.accessDuration === 0 ? "Lifetime" : `${packageData.accessDuration} Months`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-0">
                <CardContent className="p-6">
                  <Award className="h-10 w-10 text-cyan-600 dark:text-cyan-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-1">Certificate</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {packageData.hasCertificate ? "Included" : "Not Included"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-950/30 dark:to-green-950/30 border-0">
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-teal-600 dark:text-teal-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-1">Support</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {packageData.supportLevel?.charAt(0).toUpperCase() + packageData.supportLevel?.slice(1) || "Email"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Key Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packageData.benefits && Array.isArray(packageData.benefits) && packageData.benefits.length > 0 ? (
                packageData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))
              ) : Array.isArray(packageData.features) && packageData.features.length > 0 ? (
                packageData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Access to premium course content</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Courses Included</h2>

            {packageData.courses && packageData.courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {packageData.courses.map((course) => (
                  <Card
                    key={course._id.toString()}
                    className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto">
                        <Image
                          src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-6 md:w-2/3">
                        <h3 className="font-semibold text-xl mb-2">{course.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                            <span>{course.rating || 4.5}</span>
                            <span className="text-gray-500 ml-1">({course.reviewCount || 0})</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{course.duration || "10 hours"}</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{course.lessons?.length || 0} lessons</span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Instructor:</span>
                          <span className="font-medium ml-1">{course.instructor || "Instructor Name"}</span>
                        </div>

                        <div className="mt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/courses/${course.slug || course._id.toString()}`}>View Course Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No courses available for this package yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {packageData.faqs && Array.isArray(packageData.faqs) && packageData.faqs.length > 0 ? (
                packageData.faqs.map((faq, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">How long do I have access to the courses?</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        You will have access to all courses in this package for
                        {packageData.accessDuration === 0 ? " lifetime" : ` ${packageData.accessDuration || 12} months`}
                        from the date of purchase.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Can I download the course materials?</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Yes, you can download all course materials, including PDFs, worksheets, and resources for
                        offline use.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Is there a certificate upon completion?</h3>
                      <p className="text-gray-600 dark:text-gray-300">
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
  )
}
