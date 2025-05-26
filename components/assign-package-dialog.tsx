"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Package {
  _id: string
  title: string
  price: number
  duration: string
}

interface AssignPackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function AssignPackageDialog({ open, onOpenChange, userId }: AssignPackageDialogProps) {
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetchingPackages, setFetchingPackages] = useState(false)

  useEffect(() => {
    if (open) {
      fetchPackages()
    }
  }, [open])

  const fetchPackages = async () => {
    setFetchingPackages(true)
    try {
      const response = await fetch("/api/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      } else {
        toast.error("Failed to fetch packages")
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast.error("Failed to fetch packages")
    } finally {
      setFetchingPackages(false)
    }
  }

  const handleAssignPackage = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/users/assign-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          packageId: selectedPackage,
        }),
      })

      if (response.ok) {
        toast.success("Package assigned successfully")
        onOpenChange(false)
        setSelectedPackage("")
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to assign package")
      }
    } catch (error) {
      console.error("Error assigning package:", error)
      toast.error("Failed to assign package")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Package to User</DialogTitle>
          <DialogDescription>
            Select a package to assign to this user. This will give them access to all courses in the package.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="package">Package</Label>
            {fetchingPackages ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Loading packages...</span>
              </div>
            ) : (
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg._id} value={pkg._id}>
                      {pkg.title} - ₹{pkg.price} ({pkg.duration})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignPackage} disabled={loading || !selectedPackage}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
