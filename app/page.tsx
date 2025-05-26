"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Users,
  Zap,
  Shield,
  Globe,
  Play,
  Sparkles,
  ChevronRight,
  Award,
  Clock,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

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
      icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Lightning Fast Learning",
      description: "Accelerate your skills with our optimized learning paths and interactive content.",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Industry Certified",
      description: "Earn certificates recognized by top companies and boost your career prospects.",
      gradient: "from-green-400 to-blue-500",
    },
    {
      icon: <Globe className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: "Global Community",
      description: "Join thousands of learners worldwide and build your professional network.",
      gradient: "from-purple-400 to-pink-500",
    },
  ]

  const stats = [
    { number: "50K+", label: "Happy Students", icon: <Users className="h-5 w-5" /> },
    { number: "200+", label: "Expert Courses", icon: <BookOpen className="h-5 w-5" /> },
    { number: "95%", label: "Success Rate", icon: <Target className="h-5 w-5" /> },
    { number: "24/7", label: "Support", icon: <Shield className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-8 sm:pt-20 sm:pb-12 lg:pt-24 lg:pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
          <div className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-10 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-400/20 to-red-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8"
            >
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm sm:text-base">
                🚀 Transform Your Career Today
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                Master{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Digital Skills
                </span>{" "}
                That Matter
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Join thousands of professionals who've accelerated their careers with our industry-leading courses and
                expert mentorship.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2 hover:bg-gray-50">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Courses
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 pt-8 sm:pt-12 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className="text-center p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Packages Section - Now at the top */}
      <PackagesSection />

      {/* About Section */}
      <section ref={aboutSectionRef} className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              style={{
                opacity: isAboutSectionInView ? 1 : 0,
                transform: isAboutSectionInView ? "translateX(0)" : "translateX(-50px)",
                transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
              }}
              className="relative"
            >
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                <Image src="/about.jpg" alt="About Sikshaearn" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Certified</div>
                    <div className="text-sm text-gray-600">Industry Standard</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{
                opacity: isAboutSectionInView ? 1 : 0,
                transform: isAboutSectionInView ? "translateX(0)" : "translateX(50px)",
                transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.4s",
              }}
              className="space-y-6"
            >
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-4">About SikshaEarn</Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Fill The Gap Between You &{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Your Success
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  SikshaEarn is a leading educational platform that specializes in digital marketing courses. Our
                  mission is to provide high-quality training to help individuals and businesses develop the skills
                  necessary to succeed in today's digital landscape.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Users className="h-5 w-5" />, text: "Expert Instructors" },
                  { icon: <Target className="h-5 w-5" />, text: "Practical Learning" },
                  { icon: <Award className="h-5 w-5" />, text: "Industry Recognized" },
                  { icon: <Clock className="h-5 w-5" />, text: "Flexible Schedule" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/about">
                  Learn More About Us <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SikshaEarn
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of online learning with our cutting-edge platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white hover:-translate-y-2 h-full">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">Ready to Transform Your Career?</h2>
            <p className="text-xl sm:text-2xl mb-8 opacity-90 leading-relaxed">
              Join thousands of professionals who've already accelerated their careers with SikshaEarn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <FaqSection />
      <BackToTop />
      <Footer />
    </div>
  )
}
