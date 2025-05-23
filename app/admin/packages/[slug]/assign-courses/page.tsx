import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course"
import AssignCoursesForm from "@/components/assign-courses-form"

async function getPackage(slug: string) {
  await connectToDatabase()
  const packageData = await Package.findOne({ slug }).populate("courses").lean()

  if (!packageData) {
    return null
  }

  return {
    ...packageData,
    _id: packageData._id.toString(),
    courses: packageData.courses.map((course) => ({
      ...course,
      _id: course._id.toString(),
    })),
  }
}

async function getAllCourses() {
  await connectToDatabase()
  const courses = await Course.find({}).select("_id title slug thumbnail").lean()

  return courses.map((course) => ({
    ...course,
    _id: course._id.toString(),
  }))
}

export default async function AssignCoursesPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return notFound()
  }

  const packageData = await getPackage(params.slug)

  if (!packageData) {
    return notFound()
  }

  const allCourses = await getAllCourses()

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Assign Courses to Package: {packageData.title}</h1>

      <Suspense fallback={<div>Loading courses...</div>}>
        <AssignCoursesForm packageData={packageData} allCourses={allCourses} />
      </Suspense>
    </div>
  )
}
