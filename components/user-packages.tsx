"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Calendar, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface UserPackage {
  _id: string
  package: {
    _id: string
    title: string
    price: number
    duration: string
    thumbnail: string
  }
  amount: number
  status: string
  createdAt: string
  assignedBy?: {
    name: string
  }
  paymentMethod: string
}

interface UserPackagesProps {
  userId: string
}

export function UserPackages({ userId }: UserPackagesProps) {
  const [packages, setPackages] = useState<UserPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPackages()
  }, [userId])

  const fetchUserPackages = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/packages`)
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      } else {
        toast.error("Failed to fetch user packages")
      }
    } catch (error) {
      console.error("Error fetching user packages:", error)
      toast.error("Failed to fetch user packages")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading packages...</span>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="text-center p-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No packages assigned to this user</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {packages.map((userPackage) => (
        <div key={userPackage._id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <img
                src={userPackage.package.thumbnail || "/placeholder.svg"}
                alt={userPackage.package.title}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium">{userPackage.package.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>₹{userPackage.amount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{userPackage.package.duration}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Purchased on {new Date(userPackage.createdAt).toLocaleDateString()}
                </p>
                {userPackage.assignedBy && (
                  <p className="text-xs text-blue-600 mt-1">Assigned by: {userPackage.assignedBy.name}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={userPackage.status === "completed" ? "default" : "secondary"}
                className={userPackage.status === "completed" ? "bg-green-100 text-green-800" : ""}
              >
                {userPackage.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {userPackage.paymentMethod === "admin_assignment" ? "Admin Assigned" : userPackage.paymentMethod}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
