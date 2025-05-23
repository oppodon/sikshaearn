"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, MoreHorizontal, Plus, Search, Loader2, PackageIcon, Tag, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"

interface PackageType {
  _id: string
  title: string
  slug: string
  price: number
  originalPrice?: number
  accessDuration?: number
  supportLevel?: string
  maxCourses?: number
  isPopular: boolean
  isActive: boolean
  courses: any[]
  createdAt: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/packages")

      if (!response.ok) {
        throw new Error("Failed to fetch packages")
      }

      const data = await response.json()
      setPackages(data.packages || [])
    } catch (error) {
      console.error("Error fetching packages:", error)
      setPackages([]) // Ensure packages is set to an empty array on error
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (slug: string) => {
    setPackageToDelete(slug)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!packageToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/packages/${packageToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Package deleted successfully",
        })
        fetchPackages()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete package")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
    }
  }

  const formatDuration = (months?: number) => {
    if (months === undefined || months === null) return "Not set"
    if (months === 0) return "Lifetime"
    if (months === 1) return "1 Month"
    return `${months} Months`
  }

  const formatSupportLevel = (level?: string) => {
    if (!level) return "Not set"
    switch (level) {
      case "basic":
        return "Basic"
      case "priority":
        return "Priority"
      case "24/7":
        return "24/7"
      case "vip":
        return "VIP"
      default:
        return level
    }
  }

  const formatCourseCount = (count?: number) => {
    if (count === undefined || count === null) return "Not set"
    if (count === 0) return "All Courses"
    return `${count} Courses`
  }

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || formatCurrency(pkg.price).includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Package Management</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/admin/packages/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Package
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : packages.length}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-24 mt-1" />
              ) : (
                `${packages.filter((p) => p.isActive).length} active packages`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                new Set(packages.flatMap((p) => p.courses?.map((c) => c._id) || [])).size
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-24 mt-1" /> : "Across all packages"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Packages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : packages.filter((p) => p.isPopular).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-24 mt-1" /> : "Marked as popular"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Packages</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search packages..."
                className="w-full pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Support</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-50" />
                          <p>No packages found matching "{searchTerm}"</p>
                          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                            Clear search
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <PackageIcon className="h-8 w-8 mb-2 opacity-50" />
                          <p>No packages found. Create your first package.</p>
                          <Button variant="link" onClick={() => router.push("/admin/packages/create")} className="mt-2">
                            Create Package
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map((pkg) => (
                    <TableRow key={pkg._id}>
                      <TableCell>
                        <div className="font-medium">{pkg.title}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(pkg.price)}</TableCell>
                      <TableCell>{formatDuration(pkg.accessDuration)}</TableCell>
                      <TableCell>{formatSupportLevel(pkg.supportLevel)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {formatCourseCount(pkg.maxCourses)}
                          {pkg.courses?.length > 0 && (
                            <Badge variant="outline" className="ml-1">
                              {pkg.courses.length} assigned
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {pkg.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                          {pkg.isPopular && <Badge className="bg-primary">Popular</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/packages/${pkg.slug}`)}>
                              View Package
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/packages/${pkg.slug}/edit`)}>
                              Edit Package
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/packages/${pkg.slug}/assign-courses`)}>
                              Manage Courses
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(pkg.slug)}>
                              Delete Package
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <strong>1-{filteredPackages.length || 0}</strong> of{" "}
              <strong>{filteredPackages.length || 0}</strong> packages
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!packages || packages.length < 10}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this package?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the package and may affect users who have
              purchased it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
