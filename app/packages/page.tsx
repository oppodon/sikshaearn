import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Star, Users, BookOpen, Sparkles, ArrowRight, Crown, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"

// Loading component for packages
function PackagesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-col relative overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardHeader className="text-center pt-6 pb-4">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-8 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-start">
                  <Skeleton className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// Fetch packages from database
async function getPackages() {
  await connectToDatabase()

  const packages = await Package.find({})
    .sort({ price: 1 })
    .select("title slug description price originalPrice thumbnail isPopular courseCount studentCount features")
    .lean()

  return packages
}

export default async function PackagesPage() {
  const packages = await getPackages()

  const packageIcons = [
    { icon: <Zap className="h-6 w-6" />, gradient: "from-blue-500 to-cyan-500" },
    { icon: <Crown className="h-6 w-6" />, gradient: "from-purple-500 to-pink-500" },
    { icon: <Sparkles className="h-6 w-6" />, gradient: "from-green-500 to-emerald-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-0 mb-6 px-4 py-2">🚀 Choose Your Learning Path</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Accelerate Your{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Career Growth
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Choose from our carefully crafted packages designed to transform your skills and unlock new opportunities
              in the digital world.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="opacity-80">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">200+</div>
                <div className="opacity-80">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="opacity-80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="container py-16 px-4 mx-auto max-w-7xl">
        <Suspense fallback={<PackagesSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => {
              const iconData = packageIcons[index % packageIcons.length]
              const isPopular = pkg.isPopular || index === 1 // Make middle package popular by default

              return (
                <Card
                  key={pkg._id.toString()}
                  className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                    isPopular ? "scale-105 ring-2 ring-purple-500/20" : ""
                  }`}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 group-hover:from-gray-50 group-hover:to-white transition-all duration-500"></div>

                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-1 shadow-lg">
                        ⭐ MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  {/* Header Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${iconData.gradient}`}></div>
                    <Image
                      src={
                        pkg.thumbnail ||
                        `https://images.unsplash.com/photo-${1516321318423 + index}-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop`
                      }
                      alt={pkg.title}
                      fill
                      className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white">
                        {iconData.icon}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-2xl font-bold">{pkg.title}</h3>
                    </div>
                  </div>

                  <CardHeader className="text-center pt-6 pb-4 relative z-10">
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(4.9)</span>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {pkg.courseCount || 10} Courses
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {pkg.studentCount || 1000}+ Students
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        ₹{pkg.price}
                      </CardTitle>
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">₹{pkg.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                  </CardHeader>

                  <CardContent className="flex-grow relative z-10 px-6">
                    <ul className="space-y-3">
                      {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                        pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Access to all courses in this package</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Lifetime access to course materials</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Certificate of completion</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">24/7 community support</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4 pb-6 relative z-10">
                    <Button
                      asChild
                      className={`w-full h-12 font-medium rounded-xl transition-all duration-300 ${
                        isPopular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      }`}
                    >
                      <Link href={`/packages/${pkg._id.toString()}`} className="flex items-center justify-center">
                        Get Started Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </Suspense>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Why Choose Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Packages
            </span>
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            Our packages are designed by industry experts to give you the skills and knowledge needed to excel in
            today's competitive market.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert-Led Content</h3>
              <p className="text-gray-600">Learn from industry professionals with years of real-world experience</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Support</h3>
              <p className="text-gray-600">Join a vibrant community of learners and get help when you need it</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Proven Results</h3>
              <p className="text-gray-600">95% of our students report career advancement within 6 months</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Our education advisors are here to help you choose the perfect package for your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8 py-6">
                <Link href="/contact">
                  <Users className="mr-2 h-5 w-5" />
                  Talk to an Advisor
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-medium px-8 py-6"
              >
                <Link href="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse All Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
