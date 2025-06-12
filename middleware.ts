import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if user is authenticated
  const isAuthenticated = !!token

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/course", "/checkout", "/payment"]

  // Define admin-only routes
  const adminRoutes = ["/admin"]

  // Define auth routes (login, register, etc.)
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Skip middleware for API and auth callback routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is banned and trying to access protected routes, redirect to banned page
  if (isAuthenticated && token?.status === "banned" && isProtectedRoute) {
    return NextResponse.redirect(new URL("/banned", request.url))
  }

  // If the route is admin-only and the user is not an admin, redirect to dashboard
  if (isAdminRoute && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute && token?.status !== "banned") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Update the matcher to exclude auth callback routes
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
}
