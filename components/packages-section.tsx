"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  CheckCircle,
  Star,
  Clock,
  Users,
  Award,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  Sparkles,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react"
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
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPackageIcon = (index: number) => {
    const icons = [
      { icon: <Zap className="h-6 w-6" />, gradient: "from-blue-500 to-cyan-500" },
      { icon: <Crown className="h-6 w-6" />, gradient: "from-purple-500 to-pink-500" },
      { icon: <Sparkles className="h-6 w-6" />, gradient: "from-green-500 to-emerald-500" },
    ]
    return icons[index % icons.length]
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-4">
              🚀 Learning Packages
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Path
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Packages</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-red-500/10 rounded-full animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-4 px-4 py-2">
            🚀 Learning Packages
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Path
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Flexible packages designed to accelerate your career growth and unlock new opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => {
            const iconData = getPackageIcon(index)
            const isPopular = pkg.isPopular || index === 1

            return (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${isPopular ? "lg:scale-105 z-10" : ""}`}
              >
                <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 h-full bg-white">
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 shadow-lg">
                        ⭐ MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {pkg.isFeatured && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1">
                        🔥 FEATURED
                      </Badge>
                    </div>
                  )}

                  {/* Header with Icon */}
                  <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${iconData.gradient} overflow-hidden`}>
                    {pkg.thumbnail && (
                      <Image
                        src={pkg.thumbnail || "/placeholder.svg"}
                        alt={pkg.title}
                        fill
                        className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        {iconData.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-center capitalize">{pkg.title}</h3>
                      <Badge className={`mt-2 ${getLevelColor(pkg.level)}`}>{pkg.level}</Badge>
                    </div>
                  </div>

                  <CardHeader className="text-center pt-6 pb-4">
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(4.9)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {formatPrice(pkg.price)}
                      </div>
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">{formatPrice(pkg.originalPrice)}</span>
                      )}
                    </div>

                    <p className="text-gray-600 leading-relaxed text-sm">{pkg.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4 px-6">
                    {/* Package Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800 font-medium">{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                        <BookOpen className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">{pkg.courses.length} Courses</span>
                      </div>
                      {pkg.hasCertificate && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-800 font-medium">Certificate</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-800 font-medium">{pkg.supportLevel}</span>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2">
                      {[
                        `${pkg.maxCourses} Course Access`,
                        `${pkg.accessDuration} Months Access`,
                        pkg.hasMentoring && "1-on-1 Mentoring",
                        pkg.hasJobPlacement && "Job Placement Support",
                        pkg.workshopCount > 0 && `${pkg.workshopCount} Live Workshops`,
                      ]
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((feature, i) => (
                          <div key={i} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                    </div>

                    {/* Course Preview */}
                    {pkg.courses.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Popular Courses:</p>
                        <div className="space-y-1">
                          {pkg.courses.slice(0, 2).map((course) => (
                            <div key={course._id} className="text-xs text-gray-600 truncate flex items-center">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                              {course.title}
                            </div>
                          ))}
                          {pkg.courses.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{pkg.courses.length - 2} more courses included
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-4 pb-6 px-6">
                    <Button
                      asChild
                      className={`w-full h-12 font-medium rounded-xl transition-all duration-300 group-hover:scale-105 ${
                        isPopular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : pkg.isFeatured
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      }`}
                    >
                      <Link href={`/packages/${pkg._id}/checkout`} className="flex items-center justify-center">
                        Get Started Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for exciting learning opportunities!</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              Our education advisors are here to help you choose the perfect package for your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/contact">
                  <Users className="mr-2 h-4 w-4" />
                  Talk to an Advisor
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
