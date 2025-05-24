import { UserNav } from "@/components/user-nav"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard.</p>
      </div>
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </div>
  )
}
