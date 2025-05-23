"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Search, Download, Eye, ArrowRight, AlertCircle, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Withdrawal {
  _id: string
  amount: number
  method: string
  accountDetails: {
    accountName?: string
    accountNumber?: string
    bankName?: string
    branch?: string
    phoneNumber?: string
  }
  status: string
  createdAt: string
  processedAt?: string
  transactionId?: string
  rejectionReason?: string
}

interface KYCStatus {
  status: "pending" | "approved" | "rejected" | null
}

export default function PayoutsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: null })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/payouts")
      return
    }

    if (status === "authenticated") {
      fetchWithdrawals()
      fetchKYCStatus()
    }
  }, [status, router, activeTab, currentPage])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/affiliate/withdrawals?page=${currentPage}&limit=10&status=${activeTab !== "all" ? activeTab : ""}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals")
      }

      const data = await response.json()
      setWithdrawals(data.withdrawals || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("/api/kyc")

      if (!response.ok) {
        throw new Error("Failed to fetch KYC status")
      }

      const data = await response.json()

      if (data.kyc) {
        setKycStatus({
          status: data.kyc.status,
        })
      } else {
        setKycStatus({ status: null })
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error)
    }
  }

  const handleViewWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setViewDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (e) {
      return "Invalid date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer"
      case "esewa":
        return "eSewa"
      case "khalti":
        return "Khalti"
      default:
        return method
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

  const renderKYCAlert = () => {
    if (kycStatus.status === null) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>KYC Verification Required</AlertTitle>
          <AlertDescription>
            You need to complete KYC verification before you can withdraw funds.
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/kyc")}>
                <FileText className="mr-2 h-4 w-4" />
                Complete KYC Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "pending") {
      return (
        <Alert variant="warning" className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>KYC Verification Pending</AlertTitle>
          <AlertDescription>
            Your KYC verification is currently under review. You'll be able to withdraw funds once it's approved.
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "rejected") {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>KYC Verification Rejected</AlertTitle>
          <AlertDescription>
            Your KYC verification was rejected. Please submit a new verification.
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/kyc")}>
                <FileText className="mr-2 h-4 w-4" />
                Submit New KYC Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  if (status === "loading" || loading) {
    return (
      <div className="container max-w-6xl mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Withdrawal History</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Withdrawal History</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/withdrawal")}>
            Request Withdrawal
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {renderKYCAlert()}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Your Withdrawals</CardTitle>
            <CardDescription>View and track your withdrawal requests</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search withdrawals..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Download className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No withdrawals found</h3>
                  <p className="text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "You haven't made any withdrawal requests yet."
                      : `You don't have any ${activeTab} withdrawals.`}
                  </p>
                  <Button className="mt-4" onClick={() => router.push("/dashboard/withdrawal")}>
                    Request Withdrawal
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals
                          .filter((withdrawal) => {
                            if (!searchQuery) return true
                            const query = searchQuery.toLowerCase()
                            return (
                              withdrawal.method.toLowerCase().includes(query) ||
                              withdrawal.status.toLowerCase().includes(query) ||
                              (withdrawal.transactionId && withdrawal.transactionId.toLowerCase().includes(query))
                            )
                          })
                          .map((withdrawal) => (
                            <TableRow key={withdrawal._id}>
                              <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                              <TableCell>{getMethodDisplay(withdrawal.method)}</TableCell>
                              <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewWithdrawal(withdrawal)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-end space-x-2 py-4">{renderPagination()}</div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Withdrawal Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>Request ID: {selectedWithdrawal?._id}</DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedWithdrawal.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p>{getMethodDisplay(selectedWithdrawal.method)}</p>
              </div>

              {selectedWithdrawal.method === "bank_transfer" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Bank Details</p>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p>
                      <span className="font-medium">Bank:</span>{" "}
                      {selectedWithdrawal.accountDetails?.bankName
                        ? selectedWithdrawal.accountDetails.bankName
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Account Name:</span>{" "}
                      {selectedWithdrawal.accountDetails?.accountName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Account Number:</span>{" "}
                      {selectedWithdrawal.accountDetails?.accountNumber || "N/A"}
                    </p>
                    {selectedWithdrawal.accountDetails?.branch && (
                      <p>
                        <span className="font-medium">Branch:</span> {selectedWithdrawal.accountDetails.branch}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(selectedWithdrawal.method === "esewa" || selectedWithdrawal.method === "khalti") && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Payment Details</p>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p>
                      <span className="font-medium">Phone Number:</span>{" "}
                      {selectedWithdrawal.accountDetails?.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p>{formatDate(selectedWithdrawal.createdAt)}</p>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Processed Date</p>
                    <p>{formatDate(selectedWithdrawal.processedAt)}</p>
                  </div>
                )}
              </div>

              {selectedWithdrawal.transactionId && (
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedWithdrawal.transactionId}</p>
                </div>
              )}

              {selectedWithdrawal.rejectionReason && (
                <div>
                  <p className="text-sm text-muted-foreground text-red-500">Rejection Reason</p>
                  <p className="bg-red-50 p-2 rounded-md text-red-700 text-sm">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
