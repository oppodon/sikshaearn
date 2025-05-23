"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, RefreshCw } from "lucide-react"

export default function SyncBalancesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [results, setResults] = useState<any>(null)

  const syncSpecificUser = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/sync-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to sync balance")
      }

      setResults(data)
      toast.success("Balance synced successfully")
      router.refresh()
    } catch (error) {
      console.error("Error syncing balance:", error)
      toast.error(error instanceof Error ? error.message : "Failed to sync balance")
    } finally {
      setIsLoading(false)
    }
  }

  const syncAllUsers = async () => {
    setIsSyncingAll(true)
    try {
      const response = await fetch("/api/admin/sync-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to sync balances")
      }

      setResults(data)
      toast.success(`Successfully synced ${data.results?.length || 0} user balances`)
      router.refresh()
    } catch (error) {
      console.error("Error syncing all balances:", error)
      toast.error(error instanceof Error ? error.message : "Failed to sync balances")
    } finally {
      setIsSyncingAll(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Sync User Balances</h1>
      <p className="text-muted-foreground mb-8">
        This tool allows you to manually sync user balances with their transaction history.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sync Specific User</CardTitle>
            <CardDescription>Sync balance for a specific user by ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={syncSpecificUser} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync User Balance
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync All Users</CardTitle>
            <CardDescription>Sync balances for all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This operation will recalculate and update balances for all users based on their transaction history. This
              may take some time depending on the number of users.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={syncAllUsers} disabled={isSyncingAll} variant="secondary">
              {isSyncingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing All Users...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync All Balances
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {results && (
        <>
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-4">Sync Results</h2>
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(results, null, 2)}</pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
