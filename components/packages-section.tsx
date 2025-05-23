"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle, Star, Clock, Users, Award, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Course {
  _id: string
  title: string
  slug: string
  thumbnail: string
  instructor: string
}

interface Package {
  _id: string
  title: string
  slug: string
  description: string
  longDescription: string
  thumbnail: string
  price: number
  originalPrice?: number
  duration: string
  level: string
  courses: Course[]
  isActive: boolean
  isPopular: boolean
  isFeatured: boolean
  features: string[]
  benefits: string[]
  accessDuration: number
  supportLevel: string
  maxCourses: number
  workshopCount: number
  hasMentoring: boolean
  mentoringType: string
  hasJobPlacement: boolean
  hasCertificate: boolean
  category: string
}

interface PackagesResponse {
  packages: Package[]
}

export default function PackagesSection() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/packages")

        if (!response.ok) {
          throw new Error("Failed to fetch packages")
        }

        const data: PackagesResponse = await response.json()
        setPackages(data.packages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSupportLevelColor = (supportLevel: string) => {
    switch (supportLevel.toLowerCase()) {
      case "basic":
        return "text-blue-600"
      case "priority":
        return "text-purple-600"
      case "premium":
        return "text-gold-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Path
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible packages designed to accelerate your career growth
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Packages</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Path
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible packages designed to accelerate your career growth
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${pkg.isPopular ? "md:scale-105 z-10" : ""}`}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                {/* Popular Badge */}
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1 text-xs sm:text-sm">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                {/* Featured Badge */}
                {pkg.isFeatured && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-2 py-1 text-xs">
                      FEATURED
                    </Badge>
                  </div>
                )}

                {/* Package Thumbnail */}
                {pkg.thumbnail && (
                  <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden">
                    <Image
                      src={pkg.thumbnail || "/placeholder.svg"}
                      alt={pkg.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                <CardHeader className="text-center pt-4 sm:pt-6 pb-2 sm:pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold capitalize">{pkg.title}</h3>
                    <Badge className={`text-xs ${getLevelColor(pkg.level)}`}>{pkg.level}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base mb-3">{pkg.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    {pkg.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</span>
                    )}
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{formatPrice(pkg.price)}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base px-4 sm:px-6">
                  {/* Package Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span>{pkg.courses.length} Courses</span>
                    </div>
                    {pkg.hasCertificate && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                        <span>Certificate</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      <span className={getSupportLevelColor(pkg.supportLevel)}>{pkg.supportLevel} Support</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-2">
                    {[
                      `${pkg.maxCourses} Course Access`,
                      `${pkg.accessDuration} Months Access`,
                      pkg.hasMentoring && "1-on-1 Mentoring",
                      pkg.hasJobPlacement && "Job Placement",
                      pkg.workshopCount > 0 && `${pkg.workshopCount} Workshops`,
                    ]
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((feature, i) => (
                        <div key={i} className="flex items-center">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </div>
                      ))}
                  </div>

                  {/* Course Preview */}
                  {pkg.courses.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Included Courses:</p>
                      <div className="space-y-1">
                        {pkg.courses.slice(0, 2).map((course) => (
                          <div key={course._id} className="text-xs text-gray-600 truncate">
                            • {course.title}
                          </div>
                        ))}
                        {pkg.courses.length > 2 && (
                          <div className="text-xs text-blue-600">+{pkg.courses.length - 2} more courses</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 sm:pt-4 px-4 sm:px-6">
                  <Button
                    asChild
                    className={`w-full h-10 sm:h-12 font-medium rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base ${
                      pkg.isPopular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : pkg.isFeatured
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                  >
                    <Link href={`/packages/${pkg.slug}`} className="flex items-center justify-center">
                      View Package
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
