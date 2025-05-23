"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Added AlertTitle for better structure
import { Mail, Phone, MapPin, Clock, Send, Loader2, ArrowLeft, ExternalLink } from "lucide-react" // Added ArrowLeft and ExternalLink
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(150, "Subject must be 150 characters or less"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be 2000 characters or less"),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        form.reset()
      } else {
        setError(result.error || "Failed to send message")
      }
    } catch (error) {
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <Navbar />
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150 group">
              <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-150 group-hover:-translate-x-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div> */}
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto"> {/* Increased max-width slightly for larger screens */}
            {/* Page Header */}
            <div className="text-center mb-10 md:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                Contact Us
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about our courses, affiliate program, or anything else? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 xl:gap-12"> {/* Changed to 5 cols for more flexible form width */}
              {/* Contact Information & FAQ */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800">Get in Touch</CardTitle>
                    <CardDescription>Reach out to us through any of these channels.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Email</p>
                        <a
                          href="mailto:support@sikshaearn.com"
                          className="text-gray-600 hover:text-blue-700 hover:underline break-all"
                        >
                          support@sikshaearn.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Phone</p>
                        <a
                          href="tel:+9779800000000" // Replace with actual number
                          className="text-gray-600 hover:text-blue-700 hover:underline"
                        >
                          +977 98XXXXXXXX {/* Keep placeholder or update */}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Address</p>
                        <p className="text-gray-600">Kathmandu, Nepal</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Business Hours</p>
                        <p className="text-gray-600">
                          Mon - Fri: 9:00 AM - 6:00 PM NPT
                          <br />
                          Sat: 10:00 AM - 4:00 PM NPT
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800">Quick Help & FAQs</CardTitle>
                     <CardDescription>Find quick answers to common questions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Course Access Issues?</h4>
                      <p className="text-sm text-gray-600">
                        Ensure you're using the correct email. Check your spam folder for login credentials or contact support with your purchase details.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Payment Problems?</h4>
                      <p className="text-sm text-gray-600">
                        Double-check your payment information. If issues persist, include your transaction ID or a screenshot when contacting us.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Affiliate Questions?</h4>
                      <p className="text-sm text-gray-600">
                        Visit our <Link href="/affiliate-dashboard" className="text-blue-600 hover:underline">affiliate dashboard</Link> for resources or mention your affiliate ID in your message.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800">Send us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible (usually within 24 business hours).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {success && (
                      <Alert className="mb-6 bg-green-50 border-green-300 text-green-800">
                        <AlertTitle className="font-semibold">Message Sent Successfully!</AlertTitle>
                        <AlertDescription>
                          Thank you for your message! We'll review it and get back to you shortly.
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive" className="mb-6">
                         <AlertTitle className="font-semibold">Sending Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Jane Doe" disabled={isLoading} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., jane.doe@example.com"
                                    type="email"
                                    disabled={isLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Question about a course" disabled={isLoading} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please describe your query in detail here..."
                                  className="min-h-[140px] resize-y" // Allow vertical resize
                                  disabled={isLoading}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          disabled={isLoading}
                          aria-live="polite" // Announce changes for screen readers
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Optional but recommended for a complete page) */}
  
      <Footer/>
    </div>
  )
}