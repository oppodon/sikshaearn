"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Mail, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function BannedPage() {
  useEffect(() => {
    // Ensure user is signed out when they reach this page
    signOut({ redirect: false })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Account Suspended</CardTitle>
          <CardDescription className="text-red-700">
            Your account has been temporarily suspended due to a violation of our terms of service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">What this means:</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• You cannot access your dashboard</li>
              <li>• Your courses and earnings are temporarily unavailable</li>
              <li>• You cannot make new purchases or withdrawals</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Need Help?</h3>
            <div className="space-y-3">
              <Link href="/contact" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="tel:+1234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Support
                </a>
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
