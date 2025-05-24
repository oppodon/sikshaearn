"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">SynexisShiksha</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/courses"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/courses" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Courses
        </Link>
        <Link
          href="/packages"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/packages" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Packages
        </Link>
        <Link
          href="/about"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/about" ? "text-foreground" : "text-foreground/60",
          )}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/contact" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Contact
        </Link>
        {session?.user && (
          <Link
            href="/dashboard"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/dashboard") ? "text-foreground" : "text-foreground/60",
            )}
          >
            Dashboard
          </Link>
        )}
      </nav>
    </div>
  )
}
