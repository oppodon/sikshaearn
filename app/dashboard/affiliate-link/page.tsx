"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Share2, Facebook, Twitter, Linkedin, Mail, AlertCircle } from "lucide-react"
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
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard.",
    })
  }

  const shareViaEmail = () => {
    const subject = "Check out Knowledge Hub Nepal"
    const body = `I thought you might be interested in Knowledge Hub Nepal. Use my referral link to sign up: ${referralLink}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`)
  }

  const shareViaTwitter = () => {
    const text = "Check out Knowledge Hub Nepal. Use my referral link to sign up:"
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
    )
  }

  const shareViaLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Links</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Links</h2>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Share your affiliate links to earn 65% commission on direct referrals and 5% on second-level referrals.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General Link</TabsTrigger>
          <TabsTrigger value="products">Product Links</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Your Main Affiliate Link</CardTitle>
              <CardDescription>
                Share this link to earn commission on any purchase made by your referrals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="referral-link">Referral Link</Label>
                <div className="flex gap-2">
                  <Input id="referral-link" value={referralLink} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral-code">Referral Code</Label>
                <div className="flex gap-2">
                  <Input id="referral-code" value={referralCode} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode)}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Share Your Link</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={shareViaFacebook}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareViaTwitter}>
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareViaLinkedin}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareViaEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(referralLink)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product-Specific Affiliate Links</CardTitle>
              <CardDescription>Create links for specific products to track your promotions better</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {productLinks.map((product, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`product-link-${index}`}>{product.name}</Label>
                      <span className="text-sm text-muted-foreground">Commission: 65%</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id={`product-link-${index}`}
                        value={`${baseUrl}/packages/${product.slug}?ref=${referralCode}`}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(`${baseUrl}/packages/${product.slug}?ref=${referralCode}`)}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(`/packages/${product.slug}`, "_blank")}
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Materials</CardTitle>
              <CardDescription>Download and use these materials to promote Knowledge Hub Nepal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketingMaterials.map((material, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                          {material.type === "banner" ? (
                            <div className="text-center p-4 w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-sm">Banner Preview</span>
                            </div>
                          ) : (
                            <div className="text-center p-4 w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-sm">{material.type} Preview</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{material.name}</h3>
                            <p className="text-sm text-muted-foreground">{material.dimensions}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const productLinks = [
  {
    name: "Digital Marketing Mastery",
    slug: "digital-marketing-mastery",
    price: 4999,
  },
  {
    name: "Advanced JavaScript Course",
    slug: "advanced-javascript",
    price: 3999,
  },
  {
    name: "UI/UX Design Fundamentals",
    slug: "ui-ux-design-fundamentals",
    price: 4499,
  },
  {
    name: "Python for Data Science",
    slug: "python-for-data-science",
    price: 5999,
  },
]

const marketingMaterials = [
  {
    name: "Website Banner",
    type: "banner",
    dimensions: "728x90 px",
    url: "/marketing/banner-728x90.jpg",
  },
  {
    name: "Square Banner",
    type: "banner",
    dimensions: "300x250 px",
    url: "/marketing/banner-300x250.jpg",
  },
  {
    name: "Social Media Post",
    type: "social",
    dimensions: "1200x630 px",
    url: "/marketing/social-1200x630.jpg",
  },
  {
    name: "Email Template",
    type: "email",
    dimensions: "600px width",
    url: "/marketing/email-template.html",
  },
]
