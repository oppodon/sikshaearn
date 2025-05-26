"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Copy,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Sparkles,
  Target,
  TrendingUp,
  Gift,
  Users,
  DollarSign,
  QrCode,
  Download,
  MessageCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function AffiliateLinksPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login?callbackUrl=/dashboard/affiliate-link")
    }

    if (status === "authenticated") {
      // Fetch or generate referral code
      fetch("/api/user/referral-code")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.referralCode) {
            setReferralCode(data.referralCode)
          } else {
            // Generate referral code if not exists
            fetch("/api/user/generate-referral-code", { method: "POST" })
              .then((res) => res.json())
              .then((generateData) => {
                if (generateData.success && generateData.referralCode) {
                  setReferralCode(generateData.referralCode)
                }
              })
              .catch((err) => console.error("Error generating referral code:", err))
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching referral code:", err)
          setLoading(false)
        })
    }
  }, [status, session])

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const referralLink = `${baseUrl}/?ref=${referralCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "✨ Copied to clipboard!",
      description: "Your affiliate link is ready to share.",
    })
  }

  const shareViaEmail = () => {
    const subject = "🚀 Join Siksha Earn - Start Learning & Earning!"
    const body = `Hey! 👋

I've been using Siksha Earn and thought you'd love it too! It's an amazing platform where you can learn new skills and earn money at the same time.

🎯 What you'll get:
• Access to premium courses
• Earn while you learn
• Build valuable skills
• Join a community of learners

Use my special referral link to get started: ${referralLink}

Let's grow together! 🌟`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareViaWhatsApp = () => {
    const text = `🚀 Hey! Check out Siksha Earn - an amazing platform to learn and earn! 

Join using my link: ${referralLink}

🎯 Benefits:
✅ Premium courses
✅ Earn while learning  
✅ Build valuable skills
✅ Amazing community

Let's grow together! 🌟`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`)
  }

  const shareViaTwitter = () => {
    const text = "🚀 Just discovered an amazing way to learn and earn! Join me on Siksha Earn 📚💰"
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
    )
  }

  const shareViaLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="text-lg font-medium text-gray-600">Loading your affiliate tools...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
            <Link2 className="h-4 w-4" />
            Affiliate Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Affiliate Hub
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your unique links and earn amazing commissions. Turn your network into your net worth! 💰
          </p>
        </div>

        {/* Commission Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <div className="text-3xl font-bold mb-1">65%</div>
              <div className="text-green-100">Direct Referral Commission</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <div className="text-3xl font-bold mb-1">5%</div>
              <div className="text-blue-100">Second Level Commission</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <div className="text-3xl font-bold mb-1">∞</div>
              <div className="text-purple-100">Unlimited Potential</div>
            </CardContent>
          </Card>
        </div>

        {/* Alert */}
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Pro Tip:</strong> Share your links on social media, blogs, or directly with friends to maximize your
            earnings! The more you share, the more you earn! 🚀
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="links" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            <TabsTrigger
              value="links"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Link2 className="h-4 w-4 mr-2" />
              My Links
            </TabsTrigger>
            <TabsTrigger
              value="share"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Quick Share
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Marketing Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Link2 className="h-6 w-6" />
                  Your Affiliate Links
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Use these links to earn commission on any purchase made by your referrals
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="referral-link" className="text-lg font-semibold text-gray-700">
                    🔗 Main Referral Link
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="referral-link"
                      value={referralLink}
                      readOnly
                      className="flex-1 text-lg p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"
                    />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => copyToClipboard(referralLink)}
                      className="px-6 rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="referral-code" className="text-lg font-semibold text-gray-700">
                    🎯 Referral Code
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="referral-code"
                      value={referralCode}
                      readOnly
                      className="flex-1 text-lg p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono"
                    />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => copyToClipboard(referralCode)}
                      className="px-6 rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-blue-600" />
                    How It Works
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        1
                      </div>
                      <div className="font-medium">Share Your Link</div>
                      <div className="text-gray-600">Send to friends & family</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        2
                      </div>
                      <div className="font-medium">They Sign Up</div>
                      <div className="text-gray-600">Using your referral link</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        3
                      </div>
                      <div className="font-medium">You Earn</div>
                      <div className="text-gray-600">Get commission instantly</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Share2 className="h-6 w-6" />
                  Quick Share Options
                </CardTitle>
                <CardDescription className="text-green-100">
                  Share your affiliate link across different platforms with one click
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={shareViaFacebook}
                    className="h-20 flex-col gap-2 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl"
                  >
                    <Facebook className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={shareViaTwitter}
                    className="h-20 flex-col gap-2 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 rounded-xl"
                  >
                    <Twitter className="h-6 w-6 text-sky-600" />
                    <span className="text-sm font-medium">Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={shareViaLinkedin}
                    className="h-20 flex-col gap-2 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl"
                  >
                    <Linkedin className="h-6 w-6 text-blue-700" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={shareViaWhatsApp}
                    className="h-20 flex-col gap-2 border-2 border-green-200 hover:bg-green-50 hover:border-green-300 rounded-xl"
                  >
                    <MessageCircle className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={shareViaEmail}
                    className="h-20 flex-col gap-2 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl"
                  >
                    <Mail className="h-6 w-6 text-gray-600" />
                    <span className="text-sm font-medium">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(referralLink)}
                    className="h-20 flex-col gap-2 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 rounded-xl"
                  >
                    <Copy className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Copy Link</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col gap-2 border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl"
                  >
                    <QrCode className="h-6 w-6 text-indigo-600" />
                    <span className="text-sm font-medium">QR Code</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col gap-2 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 rounded-xl"
                  >
                    <Download className="h-6 w-6 text-pink-600" />
                    <span className="text-sm font-medium">Download</span>
                  </Button>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    Sharing Tips for Maximum Success
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>Share with people interested in learning and earning</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>Add a personal message explaining the benefits</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>Post in relevant groups and communities</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>Follow up with interested prospects</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6" />
                  Marketing Tools & Resources
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Professional marketing materials to boost your affiliate success
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Gift className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                    We're preparing amazing marketing materials including banners, email templates, and social media
                    content.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get Notified When Ready
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
