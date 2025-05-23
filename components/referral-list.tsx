import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Referral {
  id: string
  name: string
  email: string
  image?: string
  date: string
  status: "active" | "pending" | "inactive"
  purchases: number
  earnings: number
}

interface ReferralListProps {
  referrals: Referral[]
}

export function ReferralList({ referrals }: ReferralListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referrals</CardTitle>
        <CardDescription>People you've referred to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't referred anyone yet.</p>
            <p className="text-sm mt-1">Share your referral link to start earning commissions!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={referral.image || `/placeholder.svg?height=40&width=40`} />
                    <AvatarFallback>{referral.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{referral.name}</p>
                    <p className="text-sm text-muted-foreground">{referral.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">Joined: {referral.date}</p>
                    <p className="text-sm">Purchases: {referral.purchases}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        referral.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : referral.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Badge>
                    <p className="text-sm font-medium mt-1">Rs. {referral.earnings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
