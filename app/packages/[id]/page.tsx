import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Clock,
  Users,
  Star,
  ShoppingCart,
  BookOpen,
  Shield,
  ChevronRight,
  Play,
  Download,
  Headphones,
  Globe,
  ArrowRight,
  Award,
  Infinity,
  Target,
  TrendingUp,
  Zap,
  Heart,
  Share2,
  MonitorPlay,
  MessageCircle,
} from "lucide-react"
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

  const discountPercentage = packageData.originalPrice
    ? Math.round(((packageData.originalPrice - packageData.price) / packageData.originalPrice) * 100)
    : 0

  // Generate a beautiful background image URL from Unsplash
  const heroImageUrl =
    packageData.thumbnail ||
    `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop&crop=center&auto=format&q=80`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageUrl || "/placeholder.svg"}
            alt={packageData.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-purple-900/80 to-pink-900/90" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-1000" />

        {/* Navigation */}
        <nav className="relative z-10 border-b border-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <Link href="/packages" className="hover:text-white transition-colors">
                  Packages
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white font-medium">{packageData.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="flex items-center gap-3 mb-6">
                {packageData.isPopular && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 px-4 py-2">
                    🔥 Most Popular
                  </Badge>
                )}
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  {packageData.courses?.length || 0} Courses
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  {packageData.studentCount || 0}+ Students
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {packageData.title || "Premium Learning Package"}
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {packageData.description || "Master new skills with our comprehensive learning package"}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{packageData.courses?.length || 0}</div>
                  <div className="text-sm text-white/80">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {packageData.accessDuration === 0 ? (
                      <Infinity className="h-8 w-8 mx-auto" />
                    ) : (
                      packageData.accessDuration || 12
                    )}
                  </div>
                  <div className="text-sm text-white/80">
                    {packageData.accessDuration === 0 ? "Lifetime" : "Months"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {packageData.hasCertificate ? <Award className="h-8 w-8 mx-auto" /> : "No"}
                  </div>
                  <div className="text-sm text-white/80">Certificate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{packageData.studentCount || 0}+</div>
                  <div className="text-sm text-white/80">Students</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Link href={`/packages/${packageData._id.toString()}/checkout`}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Enroll Now - ₹{packageData.price.toLocaleString()}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Preview Course
                </Button>
              </div>
            </div>

            {/* Right Content - Package Preview */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="h-12 w-12 text-white" />
                </div>

                <div className="text-center mb-6">
                  <div className="text-white/80 text-sm mb-2">Package Price</div>
                  <div className="flex items-center justify-center gap-3">
                    {packageData.originalPrice && (
                      <span className="text-2xl text-white/60 line-through">
                        ₹{packageData.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-white">₹{packageData.price.toLocaleString()}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="text-green-400 font-semibold mt-2">Save {discountPercentage}% Today!</div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <span>Instant access to all courses</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <span>Lifetime access & updates</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <span>24/7 expert support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* What You'll Learn */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Target className="h-6 w-6" />,
                    title: "Master Core Concepts",
                    desc: "Build a solid foundation in your chosen field",
                  },
                  {
                    icon: <TrendingUp className="h-6 w-6" />,
                    title: "Advanced Techniques",
                    desc: "Learn industry-standard practices and methods",
                  },
                  {
                    icon: <MonitorPlay className="h-6 w-6" />,
                    title: "Hands-on Projects",
                    desc: "Apply your knowledge with real-world projects",
                  },
                  {
                    icon: <Award className="h-6 w-6" />,
                    title: "Professional Skills",
                    desc: "Develop skills that employers are looking for",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Course Content</h2>
                <Badge variant="outline" className="px-3 py-1">
                  {packageData.courses?.length || 0} Courses
                </Badge>
              </div>

              {packageData.courses && packageData.courses.length > 0 ? (
                <div className="space-y-6">
                  {packageData.courses.map((course, index) => (
                    <Card
                      key={course._id.toString()}
                      className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Course Thumbnail */}
                          <div className="relative w-full md:w-80 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600">
                            <Image
                              src={
                                course.thumbnail ||
                                `https://images.unsplash.com/photo-${1516321318423 + index || "/placeholder.svg"}-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop&auto=format&q=80`
                              }
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                                Course {index + 1}
                              </Badge>
                            </div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="h-8 w-8 text-white ml-1" />
                              </div>
                            </div>
                          </div>

                          {/* Course Info */}
                          <div className="flex-1 p-8">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">{course.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{course.rating || 4.8}</span>
                                <span>({course.reviewCount || 1250} reviews)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration || "8 hours"}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.lessons?.length || 24} lessons</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Beginner Friendly
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Certificate Included
                                </Badge>
                              </div>
                              <Button variant="outline" asChild className="rounded-xl">
                                <Link href={`/courses/${course.slug || course._id.toString()}`}>
                                  Preview Course
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses available yet</h3>
                  <p className="text-gray-500">Courses will be added soon. Stay tuned!</p>
                </div>
              )}
            </section>

            {/* Features Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Package Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: <Play className="h-8 w-8" />,
                    title: "Instant Access",
                    description: "Start learning immediately after enrollment",
                    gradient: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: <Download className="h-8 w-8" />,
                    title: "Downloadable Content",
                    description: "Access materials offline anytime, anywhere",
                    gradient: "from-green-500 to-emerald-500",
                  },
                  {
                    icon: <Globe className="h-8 w-8" />,
                    title: "Global Access",
                    description: "Learn from anywhere in the world",
                    gradient: "from-purple-500 to-pink-500",
                  },
                  {
                    icon: <Headphones className="h-8 w-8" />,
                    title: "Expert Support",
                    description: "Get help from industry professionals",
                    gradient: "from-orange-500 to-red-500",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Pricing Card */}
              <Card className="overflow-hidden border-0 shadow-xl bg-white">
                <CardContent className="p-0">
                  {/* Price Section */}
                  <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-white">
                    {discountPercentage > 0 && (
                      <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 rounded-full px-4 py-2 text-sm font-semibold mb-4 border border-red-200">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        {discountPercentage}% OFF Today
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {packageData.originalPrice && (
                          <span className="text-xl text-gray-400 line-through">
                            ₹{packageData.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-4xl md:text-5xl font-bold text-gray-900">
                          ₹{packageData.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600">One-time payment</p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600 font-medium">
                        <Infinity className="h-4 w-4" />
                        <span>Lifetime Access</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      asChild
                      className="w-full h-12 text-base font-semibold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Link href={`/packages/${packageData._id.toString()}/checkout`}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Enroll Now
                      </Link>
                    </Button>

                    <p className="text-xs text-gray-500">30-day money-back guarantee</p>
                  </div>

                  <Separator />

                  {/* Package Includes */}
                  <div className="p-8">
                    <h3 className="font-semibold text-gray-900 mb-6 text-center">What's included</h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: <BookOpen className="h-4 w-4" />,
                          text: `${packageData.courses?.length || 0} Premium Courses`,
                          highlight: true,
                        },
                        {
                          icon: <Clock className="h-4 w-4" />,
                          text: `${packageData.accessDuration === 0 ? "Lifetime" : `${packageData.accessDuration} months`} Access`,
                          highlight: packageData.accessDuration === 0,
                        },
                        {
                          icon: <Award className="h-4 w-4" />,
                          text: "Certificate of Completion",
                          highlight: packageData.hasCertificate,
                        },
                        {
                          icon: <MonitorPlay className="h-4 w-4" />,
                          text: "Mobile & Desktop Access",
                          highlight: false,
                        },
                        {
                          icon: <MessageCircle className="h-4 w-4" />,
                          text: "Expert Support",
                          highlight: false,
                        },
                        {
                          icon: <Download className="h-4 w-4" />,
                          text: "Downloadable Resources",
                          highlight: false,
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              item.highlight ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className={`text-sm ${item.highlight ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Trust Indicators */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">{packageData.studentCount || 0}+</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">4.9</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Risk-Free Learning</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Not satisfied? Get a full refund within 30 days, no questions asked.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Instant Access</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
