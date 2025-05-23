"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle2, Users, Award, BookOpen, Target, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden max-w-[100vw]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] min-h-[400px] sm:min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/7437489/pexels-photo-7437489.jpeg"
            alt="Education Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/20 text-white border-none text-xs sm:text-sm">
              About Sikshaearn
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Transforming Education
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto text-gray-200 leading-relaxed">
              Empowering learners worldwide with cutting-edge digital marketing education
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm">Our Mission</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                Bridging the Digital Skills Gap
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed">
                Founded in 2020, Sikshaearn has been at the forefront of digital marketing education, helping
                individuals and businesses master the digital landscape.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  "Industry Expert Instructors",
                  "Hands-on Projects",
                  "Career Support",
                  "Flexible Learning",
                  "Live Workshops",
                  "Global Community",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 sm:p-3 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg"
                  alt="Team Collaboration"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-background p-4 sm:p-6 rounded-xl shadow-xl max-w-[200px] sm:max-w-none">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold">10,000+</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Students Trained</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm">Our Values</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
              What Drives Us Forward
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              Our core values shape our approach to education and student success
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Innovation First",
                description: "Pioneering new ways of learning and teaching in the digital age",
              },
              {
                icon: <Target className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Student Success",
                description: "Focused on delivering real-world results for our learners",
              },
              {
                icon: <Users className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Community",
                description: "Building a supportive network of learners and educators",
              },
              {
                icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Quality Education",
                description: "Maintaining high standards in all our educational content",
              },
              {
                icon: <Award className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Industry Recognition",
                description: "Providing credentials that matter in the real world",
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Inclusive Learning",
                description: "Making quality education accessible to everyone",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 bg-background/80 backdrop-blur">
                  <CardContent className="p-4 sm:p-6">
                    <div className="bg-primary/10 p-2 sm:p-3 rounded-lg w-fit mb-3 sm:mb-4">{value.icon}</div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
                  alt="Our Team"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm">Our Team</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                Meet the Experts
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                Our team consists of industry veterans, certified professionals, and passionate educators committed to
                your success in the digital marketing landscape.
              </p>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  "20+ Industry Experts",
                  "Combined 50+ Years Experience",
                  "Regular Industry Updates",
                  "Dedicated Support Team",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="font-semibold w-full sm:w-auto">
                Join Our Community
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-none text-xs sm:text-sm">Our Impact</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
              Making a Difference
            </h2>
            <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">
              Our success is measured by the success of our students
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { number: "10,000+", label: "Graduates" },
              { number: "50+", label: "Courses" },
              { number: "95%", label: "Success Rate" },
              { number: "80+", label: "Countries" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-gray-200 text-xs sm:text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          >
            <div className="relative h-[300px] sm:h-[350px] md:h-[400px]">
              <Image
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
                alt="Start Learning"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center">
                <div className="max-w-2xl mx-auto text-center text-white p-4 sm:p-6 md:p-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                    Start Your Learning Journey
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
                    Join thousands of successful graduates who have transformed their careers with Sikshaearn
                  </p>
                  <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
                    Explore Courses
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}