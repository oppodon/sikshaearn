"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UpdateBalancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    updatedCount?: number
    errorCount?: number
  } | null>(null)

  const handleUpdateBalances = async () => {
    try {
      setIsUpdating(true)
      setResult(null)

      const response = await fetch("/api/admin/balance/update", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update balances")
      }

      setResult(data)

      toast({
        title: "Success",
        description: data.message || "Balances updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating balances:", error)

      setResult({
        success: false,
        message: error.message,
      })

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Update Affiliate Balances</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recalculate Affiliate Commissions</CardTitle>
          <CardDescription>
            This tool will recalculate all affiliate commissions based on approved transactions. Use this if you notice
            discrepancies in affiliate balances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This process will scan all approved transactions with referrals and update affiliate balances accordingly.
              It will only add missing commission entries and will not duplicate existing ones.
            </AlertDescription>
          </Alert>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.updatedCount !== undefined && (
                  <div className="mt-2">
                    <p>Transactions processed: {result.updatedCount}</p>
                    <p>Errors encountered: {result.errorCount}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={handleUpdateBalances} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating Balances...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Balances
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
