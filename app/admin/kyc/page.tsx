"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Download, Eye, MoreHorizontal, Search, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function KYCPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [kycSubmissions, setKycSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [selectedKYC, setSelectedKYC] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchKYCSubmissions()
    }
  }, [status, router, activeTab, currentPage, searchQuery, documentTypeFilter])

  const fetchKYCSubmissions = async () => {
    try {
      setIsLoading(true)

      let url = `/api/admin/kyc?page=${currentPage}&limit=10&status=${activeTab !== "all" ? activeTab : ""}`

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      if (documentTypeFilter && documentTypeFilter !== "all") {
        url += `&documentType=${documentTypeFilter}`
      }

      console.log("Fetching KYC data from:", url)
      const response = await fetch(url)
      const data = await response.json()
      console.log("KYC API Response:", data)

      if (response.ok) {
        // Normalize the data to ensure all required fields exist
        const normalizedData = (data.kycSubmissions || []).map((kyc: any) => ({
          ...kyc,
          userId: kyc.userId || { name: "Unknown User", email: "" },
          documentType: kyc.documentType || "unknown",
          documentNumber: kyc.documentNumber || "",
          status: kyc.status || "pending",
          submittedAt: kyc.submittedAt || new Date().toISOString(),
        }))

        setKycSubmissions(normalizedData)
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.totalCount || 0)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch KYC submissions",
          variant: "destructive",
        })
        // Set empty data on error
        setKycSubmissions([])
        setTotalPages(1)
        setTotalCount(0)
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      // Set empty data on error
      setKycSubmissions([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewKYC = (kyc: any) => {
    setSelectedKYC(kyc)
    setViewDialogOpen(true)
  }

  const handleApproveKYC = (kyc: any) => {
    setSelectedKYC(kyc)
    setApproveDialogOpen(true)
  }

  const handleRejectKYC = (kyc: any) => {
    setSelectedKYC(kyc)
    setRejectDialogOpen(true)
  }

  const confirmApproveKYC = async () => {
    if (!selectedKYC) return

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/kyc/${selectedKYC._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "KYC submission approved successfully",
          variant: "default",
        })

        // Refresh the list
        fetchKYCSubmissions()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve KYC submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving KYC:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setApproveDialogOpen(false)
    }
  }

  const confirmRejectKYC = async () => {
    if (!selectedKYC || !rejectionReason) return

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/kyc/${selectedKYC._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "KYC submission rejected",
          variant: "default",
        })

        // Refresh the list
        fetchKYCSubmissions()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject KYC submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setRejectDialogOpen(false)
      setRejectionReason("")
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700"
      case "approved":
        return "border-green-200 bg-green-50 text-green-700"
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700"
      default:
        return "border-gray-200 bg-gray-50 text-gray-700"
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "national_id":
        return "National ID Card"
      case "citizenship":
        return "Citizenship"
      case "license":
        return "Driver's License"
      default:
        return type || "Unknown"
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber

            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (currentPage <= 3) {
              pageNumber = i + 1
              if (i === 4)
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
              if (i === 0)
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
            } else {
              if (i === 0)
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              if (i === 4)
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              pageNumber = currentPage - 1 + i
            }

            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink isActive={currentPage === pageNumber} onClick={() => setCurrentPage(pageNumber)}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight">KYC Verification</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">KYC Verification</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export Data</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between bg-muted/30">
          <CardTitle>Verification Requests</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="w-full pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="citizenship">Citizenship</SelectItem>
                  <SelectItem value="license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Rejected
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                All Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0 p-0">
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                            <div className="text-sm text-muted-foreground">Loading KYC submissions...</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : kycSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="rounded-full bg-muted p-3">
                              <FileIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-lg font-medium">No KYC submissions found</div>
                            <div className="text-sm text-muted-foreground">
                              {activeTab !== "all"
                                ? `There are no ${activeTab} KYC submissions at the moment.`
                                : "There are no KYC submissions in the system yet."}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      kycSubmissions.map((kyc) => (
                        <TableRow key={kyc._id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={kyc.userId?.image || "/placeholder.svg?height=32&width=32"}
                                  alt={kyc.userId?.name || "Unknown"}
                                />
                                <AvatarFallback>
                                  {kyc.userId?.name
                                    ? kyc.userId.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                    : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{kyc.userId?.name || "Unknown User"}</div>
                                <div className="text-xs text-muted-foreground">{kyc.userId?.email || ""}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getDocumentTypeName(kyc.documentType)}</TableCell>
                          <TableCell>{kyc.documentNumber || "N/A"}</TableCell>
                          <TableCell>
                            {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : "Unknown date"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(kyc.status)}>
                              {kyc.status ? kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1) : "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewKYC(kyc)}>
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewKYC(kyc)}>View Details</DropdownMenuItem>
                                  {kyc.status === "pending" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleApproveKYC(kyc)}>Approve</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRejectKYC(kyc)}>Reject</DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => window.open(kyc.documentImage, "_blank")}>
                                    View Document
                                  </DropdownMenuItem>
                                  {kyc.selfieImage && (
                                    <DropdownMenuItem onClick={() => window.open(kyc.selfieImage, "_blank")}>
                                      View Selfie
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <strong>
                    {kycSubmissions.length > 0 ? (currentPage - 1) * 10 + 1 : 0}-
                    {Math.min(currentPage * 10, totalCount)}
                  </strong>{" "}
                  of <strong>{totalCount}</strong> requests
                </div>
                {renderPagination()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View KYC Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>KYC Submission Details</DialogTitle>
            <DialogDescription>Review the submitted KYC documents and information</DialogDescription>
          </DialogHeader>

          {selectedKYC && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">User Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedKYC.userId?.image || "/placeholder.svg?height=40&width=40"}
                          alt={selectedKYC.userId?.name || ""}
                        />
                        <AvatarFallback>
                          {selectedKYC.userId?.name
                            ? selectedKYC.userId.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedKYC.userId?.name || "Unknown User"}</div>
                        <div className="text-sm text-muted-foreground">{selectedKYC.userId?.email || ""}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-2">Document Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Document Type:</span>
                      <span className="text-sm">{getDocumentTypeName(selectedKYC.documentType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Document Number:</span>
                      <span className="text-sm">{selectedKYC.documentNumber || "N/A"}</span>
                    </div>
                    {selectedKYC.fullName && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Full Name on Document:</span>
                        <span className="text-sm">{selectedKYC.fullName}</span>
                      </div>
                    )}
                    {selectedKYC.dateOfBirth && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Date of Birth:</span>
                        <span className="text-sm">{new Date(selectedKYC.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedKYC.address && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Address:</span>
                        <span className="text-sm">{selectedKYC.address}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Submitted On:</span>
                      <span className="text-sm">
                        {selectedKYC.submittedAt ? new Date(selectedKYC.submittedAt).toLocaleString() : "Unknown date"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="outline" className={getStatusBadgeClass(selectedKYC.status)}>
                        {selectedKYC.status
                          ? selectedKYC.status.charAt(0).toUpperCase() + selectedKYC.status.slice(1)
                          : "Unknown"}
                      </Badge>
                    </div>

                    {selectedKYC.status === "approved" && selectedKYC.verifiedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Verified On:</span>
                        <span className="text-sm">{new Date(selectedKYC.verifiedAt).toLocaleString()}</span>
                      </div>
                    )}

                    {selectedKYC.status === "rejected" && (
                      <>
                        {selectedKYC.verifiedAt && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Rejected On:</span>
                            <span className="text-sm">{new Date(selectedKYC.verifiedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {selectedKYC.rejectionReason && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Rejection Reason:</span>
                            <p className="text-sm mt-1 p-2 bg-red-50 rounded border border-red-100">
                              {selectedKYC.rejectionReason}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Document Image</h3>
                  <div className="border rounded-md overflow-hidden">
                    <img
                      src={selectedKYC.documentImage || "/placeholder.svg?height=300&width=400"}
                      alt="Document"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {selectedKYC.selfieImage && (
                    <>
                      <h3 className="text-lg font-medium mt-6 mb-2">Selfie with Document</h3>
                      <div className="border rounded-md overflow-hidden">
                        <img
                          src={selectedKYC.selfieImage || "/placeholder.svg?height=300&width=400"}
                          alt="Selfie with Document"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedKYC.status === "pending" && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false)
                      handleRejectKYC(selectedKYC)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false)
                      handleApproveKYC(selectedKYC)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve KYC Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve KYC Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this KYC submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproveKYC}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject KYC Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Submission</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this KYC submission.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRejectKYC} disabled={isProcessing || !rejectionReason.trim()}>
              {isProcessing ? "Processing..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for the empty state
function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
