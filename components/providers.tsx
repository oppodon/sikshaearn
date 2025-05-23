"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "./ui/sidebar"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </SessionProvider>
    </SidebarProvider>
  )
}
