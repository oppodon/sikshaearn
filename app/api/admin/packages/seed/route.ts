import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Sample package data for seeding
const samplePackages = [
  {
    title: "Silver Package",
    slug: "silver-package",
    description: "Perfect for beginners looking to start their digital marketing journey.",
    longDescription:
      "The Silver Package is designed for beginners who want to start their digital marketing journey. With access to 5 core courses, you'll learn the fundamentals of digital marketing, including social media marketing, content creation, and basic SEO techniques. This package includes 3 months of access, basic support, and a certificate upon completion.",
    price: 999,
    originalPrice: 1499,
    thumbnail: "/placeholder.svg?height=200&width=300",
    isPopular: false,
    courseCount: 5,
    studentCount: 1250,
    features: ["5 Core Courses", "Basic Support", "3 Months Access", "Certificate"],
    benefits: [
      "Learn at your own pace with flexible online courses",
      "Gain practical skills that can be applied immediately",
      "Receive a certificate upon completion of each course",
      "Access to a community of fellow learners",
      "Regular updates to course content",
    ],
    faqs: [
      {
        question: "How long do I have access to the courses?",
        answer: "You will have access to all courses in the Silver Package for 3 months from the date of purchase.",
      },
      {
        question: "Can I download the course materials?",
        answer:
          "Yes, you can download all course materials, including PDFs, worksheets, and resources for offline use.",
      },
      {
        question: "Is there a certificate upon completion?",
        answer: "Yes, you will receive a certificate of completion for each course you finish in the package.",
      },
      {
        question: "What kind of support is included?",
        answer: "The Silver Package includes basic email support with a response time of 48 hours.",
      },
    ],
  },
  {
    title: "Gold Package",
    slug: "gold-package",
    description: "Ideal for those seeking to expand their digital marketing skills.",
    longDescription:
      "The Gold Package is perfect for those who want to expand their digital marketing skills. With access to 10 courses, you'll learn advanced techniques in social media marketing, content creation, SEO, email marketing, and more. This package includes 6 months of access, priority support, a certificate upon completion, and 1 live workshop.",
    price: 1999,
    originalPrice: 2999,
    thumbnail: "/placeholder.svg?height=200&width=300",
    isPopular: true,
    courseCount: 10,
    studentCount: 2450,
    features: ["10 Courses", "Priority Support", "6 Months Access", "Certificate", "1 Live Workshop"],
    benefits: [
      "Comprehensive curriculum covering all aspects of digital marketing",
      "Priority support with 24-hour response time",
      "Access to monthly live Q&A sessions with instructors",
      "Exclusive access to industry case studies",
      "Networking opportunities with fellow professionals",
    ],
    faqs: [
      {
        question: "How long do I have access to the courses?",
        answer: "You will have access to all courses in the Gold Package for 6 months from the date of purchase.",
      },
      {
        question: "What is included in the live workshop?",
        answer:
          "The live workshop is a 3-hour interactive session with industry experts focusing on current digital marketing trends and strategies.",
      },
      {
        question: "Can I get a refund if I'm not satisfied?",
        answer: "Yes, we offer a 14-day money-back guarantee if you're not satisfied with the package.",
      },
      {
        question: "How is the priority support different from basic support?",
        answer:
          "Priority support includes faster response times (within 24 hours) and access to direct messaging with course instructors.",
      },
    ],
  },
  {
    title: "Diamond Package",
    slug: "diamond-package",
    description: "Comprehensive package for serious digital marketing professionals.",
    longDescription:
      "The Diamond Package is designed for serious digital marketing professionals who want to master all aspects of the field. With access to all 15 courses, you'll gain in-depth knowledge of advanced digital marketing strategies, analytics, conversion optimization, and more. This package includes 12 months of access, 24/7 support, a certificate upon completion, and 3 live workshops.",
    price: 2999,
    originalPrice: 4499,
    thumbnail: "/placeholder.svg?height=200&width=300",
    isPopular: false,
    courseCount: 15,
    studentCount: 1850,
    features: [
      "All Courses",
      "24/7 Support",
      "12 Months Access",
      "Certificate",
      "3 Live Workshops",
      "1-on-1 Mentoring",
    ],
    benefits: [
      "Complete mastery of digital marketing concepts and strategies",
      "Round-the-clock support for all your questions and concerns",
      "Personalized feedback on your marketing campaigns",
      "Access to exclusive advanced workshops and webinars",
      "One-on-one mentoring sessions with industry experts",
    ],
    faqs: [
      {
        question: "How many mentoring sessions are included?",
        answer:
          "The Diamond Package includes 3 one-on-one mentoring sessions (1 hour each) with our expert instructors.",
      },
      {
        question: "Can I request specific topics for the live workshops?",
        answer:
          "Yes, Diamond Package members can suggest topics for upcoming workshops, and we'll do our best to accommodate your requests.",
      },
      {
        question: "Is there a community for Diamond Package members?",
        answer:
          "Yes, you'll get access to our exclusive Diamond members community where you can network with other professionals and get additional support.",
      },
      {
        question: "Do you offer job placement assistance?",
        answer:
          "While we don't guarantee job placement, Diamond Package members receive career guidance and can request recommendation letters from our instructors.",
      },
    ],
  },
  {
    title: "Heroic Package",
    slug: "heroic-package",
    description: "Ultimate package for those aiming to master digital marketing.",
    longDescription:
      "The Heroic Package is our most comprehensive offering, designed for those who want to become true masters of digital marketing. With lifetime access to all courses (including future additions), VIP support, unlimited workshops, weekly mentoring, and job placement assistance, this package provides everything you need to excel in your digital marketing career.",
    price: 4999,
    originalPrice: 7499,
    thumbnail: "/placeholder.svg?height=200&width=300",
    isPopular: false,
    courseCount: 20,
    studentCount: 950,
    features: [
      "All Courses",
      "VIP Support",
      "Lifetime Access",
      "Certificate",
      "Unlimited Workshops",
      "Weekly Mentoring",
      "Job Placement Assistance",
    ],
    benefits: [
      "Lifetime access to all current and future courses",
      "VIP support with guaranteed response within 4 hours",
      "Weekly one-on-one mentoring sessions with industry experts",
      "Personalized career development plan",
      "Access to our exclusive job board with premium opportunities",
      "Guaranteed internship placement with partner companies",
    ],
    faqs: [
      {
        question: "What does lifetime access mean?",
        answer:
          "Lifetime access means you'll have access to all current courses in the package, plus any new courses we add to the package in the future, for as long as our platform exists.",
      },
      {
        question: "How does the job placement assistance work?",
        answer:
          "Our team works with you to prepare your resume, portfolio, and interview skills. We then connect you with our network of hiring partners and advocate for your placement in suitable positions.",
      },
      {
        question: "Can I upgrade from another package?",
        answer:
          "Yes, you can upgrade from any other package by paying the difference in price. Contact our support team for assistance with upgrading.",
      },
      {
        question: "Is there a limit to how many mentoring sessions I can schedule?",
        answer:
          "Heroic Package members can schedule one mentoring session per week (52 sessions per year) with our expert instructors.",
      },
    ],
  },
]

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Clear existing packages if requested
    const searchParams = req.nextUrl.searchParams
    const clear = searchParams.get("clear") === "true"

    if (clear) {
      await Package.deleteMany({})
    }

    // Check if packages already exist
    const existingCount = await Package.countDocuments()

    if (existingCount > 0 && !clear) {
      return NextResponse.json(
        {
          success: true,
          message: `Packages already exist. ${existingCount} packages found. Use ?clear=true to reset.`,
        },
        { status: 200 },
      )
    }

    // Insert sample packages
    await Package.insertMany(samplePackages)

    return NextResponse.json(
      {
        success: true,
        message: `Successfully seeded ${samplePackages.length} packages`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error seeding packages:", error)
    return NextResponse.json({ success: false, error: "Failed to seed packages. Please try again." }, { status: 500 })
  }
}
