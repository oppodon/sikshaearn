import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (NPR)
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "₹0"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Format as NPR currency
  return `₹${numAmount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return ""

  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return "0"

  const numValue = typeof num === "string" ? Number.parseFloat(num) : num
  return numValue.toLocaleString("en-IN")
}

/**
 * Truncate a string to a specified length
 */
export function truncateString(str: string, maxLength = 50): string {
  if (!str) return ""
  if (str.length <= maxLength) return str

  return `${str.substring(0, maxLength)}...`
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return ""

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}
