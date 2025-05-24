"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Search, FileDown, Eye } from "lucide-react"
import Image from "next/image"

interface Transaction {
  _id: string
  userId: string
  userName: string
  userEmail: string
  type: string
  amount: number
  status: string
  createdAt: string
  method: string
  reference: string
  paymentProof: string
  packageName: string
  rejectionReason?: string
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [activeTab])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/transactions?status=${activeTab === "all" ? "" : activeTab}`)

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      console.log("Fetched transactions:", data)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (transactionId: string) => {
    try {
      setIsProcessing(true)

      const response = await fetch("/api/admin/transactions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve transaction")
      }

      toast({
        title: "Success",
        description: "Transaction approved successfully",
      })

      // Update the transaction in the list
      setTransactions(transactions.map((t) => (t._id === transactionId ? { ...t, status: "approved" } : t)))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedTransaction) return

    try {
      setIsProcessing(true)

      if (!rejectReason.trim()) {
        throw new Error("Please provide a reason for rejection")
      }

      const response = await fetch("/api/admin/transactions/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: selectedTransaction._id,
          reason: rejectReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject transaction")
      }

      toast({
        title: "Success",
        description: "Transaction rejected successfully",
      })

      // Update the transaction in the list
      setTransactions(transactions.map((t) => (t._id === selectedTransaction._id ? { ...t, status: "rejected" } : t)))

      // Close dialog and reset
      setShowRejectDialog(false)
      setRejectReason("")
      setSelectedTransaction(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowRejectDialog(true)
  }

  const openViewDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowViewDialog(true)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      transaction.userName?.toLowerCase().includes(query) ||
      transaction.reference?.toLowerCase().includes(query) ||
      transaction._id.toLowerCase().includes(query) ||
      transaction.packageName?.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("all")}
          >
            All Transactions
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "pending" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "completed" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "rejected" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Transactions</h2>
          <p className="text-sm text-gray-500">Manage all payment transactions in the system.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Package</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-left p-4 font-medium">Reference</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{transaction.userName}</div>
                        <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                      </div>
                    </td>
                    <td className="p-4 max-w-[150px]">
                      <div className="truncate" title={transaction.packageName}>
                        {transaction.packageName}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{formatAmount(transaction.amount)}</td>
                    <td className="p-4 capitalize">{transaction.method?.replace("_", " ")}</td>
                    <td className="p-4 font-mono text-sm">{transaction.reference}</td>
                    <td className="p-4">{formatDate(transaction.createdAt)}</td>
                    <td className="p-4">{getStatusBadge(transaction.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => openViewDialog(transaction)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {(transaction.status === "pending" || transaction.status === "pending_verification") && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => handleApprove(transaction._id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              onClick={() => openRejectDialog(transaction)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Transaction Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Transaction ID: {selectedTransaction?._id}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Transaction Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-mono">{selectedTransaction._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reference:</span>
                        <span className="font-mono">{selectedTransaction.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-semibold">{formatAmount(selectedTransaction.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="capitalize">{selectedTransaction.method?.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(selectedTransaction.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(selectedTransaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">User Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span>{selectedTransaction.userName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span>{selectedTransaction.userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Package Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Package:</span>
                        <span>{selectedTransaction.packageName}</span>
                      </div>
                    </div>
                  </div>
                  {selectedTransaction.rejectionReason && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Rejection Reason</h3>
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {selectedTransaction.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Payment Proof</h3>
                  <div className="relative h-96 w-full rounded-lg overflow-hidden border bg-gray-50">
                    <Image
                      src={selectedTransaction.paymentProof || "/placeholder.svg?height=400&width=400"}
                      alt="Payment proof screenshot"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=400&width=400"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {(selectedTransaction?.status === "pending" || selectedTransaction?.status === "pending_verification") && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setShowViewDialog(false)
                    openRejectDialog(selectedTransaction)
                  }}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    setShowViewDialog(false)
                    handleApprove(selectedTransaction._id)
                  }}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Transaction Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this transaction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">User</Label>
                <p className="font-medium">{selectedTransaction?.userName}</p>
              </div>
              <div>
                <Label className="text-gray-500">Amount</Label>
                <p className="font-medium">{selectedTransaction ? formatAmount(selectedTransaction.amount) : ""}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1.5"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectReason.trim()}>
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                "Reject Transaction"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
