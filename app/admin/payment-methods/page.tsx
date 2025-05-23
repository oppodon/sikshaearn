"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, QrCode } from "lucide-react"

interface PaymentMethod {
  _id: string
  name: string
  qrCodeUrl: string
  instructions: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PaymentMethodsPage() {
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/payment-methods?admin=true")

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods")
      }

      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete payment method")
      }

      setPaymentMethods((prev) => prev.filter((method) => method._id !== id))
      toast({
        title: "Success",
        description: "Payment method deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Manage payment QR codes and instructions for your customers.</p>
        </div>
        <Button asChild>
          <Link href="/admin/payment-methods/create">
            <Plus className="mr-2 h-4 w-4" /> Add Payment Method
          </Link>
        </Button>
      </div>

      <Separator className="my-6" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="pt-6">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Payment Methods</CardTitle>
            <CardDescription className="text-center mb-6">
              You haven't added any payment methods yet. Add one to allow customers to pay for packages.
            </CardDescription>
            <Button asChild>
              <Link href="/admin/payment-methods/create">
                <Plus className="mr-2 h-4 w-4" /> Add Payment Method
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <Card key={method._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{method.name}</CardTitle>
                    <CardDescription>{new Date(method.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={method.isActive ? "default" : "secondary"}>
                    {method.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  <Image
                    src={method.qrCodeUrl || "/placeholder.svg"}
                    alt={`${method.name} QR Code`}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{method.instructions}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/admin/payment-methods/${method._id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog open={deleteId === method._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteId(method._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this payment method. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(method._id)}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
