"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  Play,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import BackToTop from "@/components/backtotop"
import FeaturesSection from "@/components/featuresection"
import FaqSection from "@/components/faq"
import PackagesSection from "@/components/packages-section"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const aboutSectionRef = useRef(null)
  const isAboutSectionInView = useInView(aboutSectionRef, {
    once: true,
    amount: 0.2,
  })

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setIsVisible(true)

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast Learning",
      description: "Accelerate your skills with our optimized learning paths and interactive content.",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Industry Certified",
      description: "Earn certificates recognized by top companies and boost your career prospects.",
      gradient: "from-green-400 to-blue-500",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Community",
      description: "Join thousands of learners worldwide and build your professional network.",
      gradient: "from-purple-400 to-pink-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Marketing Manager",
      content: "This platform transformed my career. The courses are practical and the community is amazing!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      content: "The best investment I've made in my professional development. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      content: "The instructors are world-class and the content is always up-to-date with industry trends.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-x-hidden max-w-[100vw]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-bounce delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div
              className={`space-y-6 sm:space-y-8 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 py-1 sm:px-4 sm:py-2">
                  🚀 Transform Your Career Today
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Master{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Digital Skills
                  </span>{" "}
                  That Matter
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                  Join thousands of professionals who've accelerated their careers with our industry-leading courses and
                  expert mentorship.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6"
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Learning Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 border-2 hover:bg-gray-50"
                >
                  <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Browse Courses
                </Button>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:space-x-8 pt-4 sm:pt-8">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">200+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative">
                <div className="aspect-[3/2] w-full relative rounded-2xl shadow-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                    alt="Students learning"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">Career Growth</div>
                        <div className="text-xs sm:text-sm text-gray-600">Average 40% salary increase</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutSectionRef} className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              style={{
                opacity: isAboutSectionInView ? 1 : 0,
                transform: isAboutSectionInView ? "translateX(0)" : "translateX(-50px)",
                transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
              }}
              className="relative"
            >
              <div className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/about.jpg"
                  alt="About Sikshaearn"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              style={{
                opacity: isAboutSectionInView ? 1 : 0,
                transform: isAboutSectionInView ? "translateX(0)" : "translateX(50px)",
                transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.4s",
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold font-montserrat mb-4 sm:mb-6">About Sikshaearn</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6">Fill The Gap Between You & Your Success.</p>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base">
                Sikshaearn is a leading educational platform that specializes in digital marketing courses. Our mission
                is to provide high-quality training to help individuals and businesses develop the skills necessary to
                succeed in today's digital landscape.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-sm sm:text-base">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Expert Instructors</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Practical Learning</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Industry Recognized</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Flexible Schedule</span>
                </div>
              </div>
              <Button asChild>
                <Link href="/about">
                  Learn More About Us <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* Packages Section */}
   <PackagesSection />
      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SikshaEarn
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of online learning with our cutting-edge platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:-translate-y-2"
              >
                <CardHeader className="text-center pb-2 sm:pb-4">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{feature.title}</h3>
                </CardHeader>
                <CardContent className="text-center text-sm sm:text-base">
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Students Say
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Join thousands of successful graduates</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-full mr-3 sm:mr-4 overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg?height=48&width=48"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of professionals who've already accelerated their careers with SikshaEarn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6"
            >
              <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6"
            >
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Join Community
            </Button>
          </div>
        </div>
      </section>

      <FaqSection />
      <BackToTop />
      <Footer />
    </div>
  )
}