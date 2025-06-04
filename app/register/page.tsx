"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to packages page
    router.push("/packages")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to packages...</p>
      </div>
    </div>
  )
}
