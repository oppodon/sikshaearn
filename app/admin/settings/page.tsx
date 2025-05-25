import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <div className="flex items-center gap-2">
          <Button>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic information about your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="Siksha Earn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input id="site-url" defaultValue="https://knowledgehubnepal.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  defaultValue="Siksha Earn is a premier e-learning platform offering high-quality courses on digital marketing, communication skills, and personal development."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" defaultValue="admin@knowledgehubnepal.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@knowledgehubnepal.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="asia-kathmandu">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia-kathmandu">Asia/Kathmandu (GMT+5:45)</SelectItem>
                    <SelectItem value="asia-kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                    <SelectItem value="asia-dhaka">Asia/Dhaka (GMT+6:00)</SelectItem>
                    <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the site will display a maintenance message to visitors
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Configure your social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" defaultValue="https://facebook.com/knowledgehubnepal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" defaultValue="https://instagram.com/knowledgehubnepal" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input id="youtube" defaultValue="https://youtube.com/knowledgehubnepal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" defaultValue="https://linkedin.com/company/knowledgehubnepal" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Configure your payment processing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Razorpay</Label>
                  <p className="text-sm text-muted-foreground">Accept payments via Razorpay</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="razorpay-key">Razorpay Key ID</Label>
                  <Input id="razorpay-key" defaultValue="rzp_test_1234567890" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razorpay-secret">Razorpay Secret</Label>
                  <Input id="razorpay-secret" defaultValue="••••••••••••••••" type="password" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>PayPal</Label>
                  <p className="text-sm text-muted-foreground">Accept payments via PayPal</p>
                </div>
                <Switch />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                  <Input id="paypal-client-id" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypal-secret">PayPal Secret</Label>
                  <Input id="paypal-secret" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="inr">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                    <SelectItem value="gbp">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate Settings</CardTitle>
              <CardDescription>Configure your affiliate program settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="affiliate-program">Affiliate Program</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable the affiliate program</p>
                </div>
                <Switch id="affiliate-program" defaultChecked />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commission-rate">Default Commission Rate (%)</Label>
                  <Input id="commission-rate" defaultValue="20" type="number" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-threshold">Minimum Payout Threshold (₹)</Label>
                  <Input id="payout-threshold" defaultValue="1000" type="number" min="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-schedule">Payout Schedule</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="payout-schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure your email sending settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-provider">Email Provider</Label>
                <Select defaultValue="smtp">
                  <SelectTrigger id="email-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailchimp">Mailchimp</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" defaultValue="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" defaultValue="587" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input id="smtp-username" defaultValue="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input id="smtp-password" defaultValue="••••••••••••••••" type="password" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input id="from-email" defaultValue="noreply@knowledgehubnepal.com" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-encryption">Use Encryption (TLS/SSL)</Label>
                  <p className="text-sm text-muted-foreground">Enable secure email transmission</p>
                </div>
                <Switch id="email-encryption" defaultChecked />
              </div>

              <Button variant="outline">Send Test Email</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Configure your email notification templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template-welcome">Welcome Email</Label>
                <Textarea
                  id="template-welcome"
                  rows={4}
                  defaultValue="Welcome to Siksha Earn! We're excited to have you join our community of learners..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-purchase">Purchase Confirmation</Label>
                <Textarea
                  id="template-purchase"
                  rows={4}
                  defaultValue="Thank you for your purchase! Your order details are below..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-reset">Password Reset</Label>
                <Textarea
                  id="template-reset"
                  rows={4}
                  defaultValue="You requested a password reset. Click the link below to reset your password..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure your platform security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch id="two-factor" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="force-ssl">Force SSL</Label>
                  <p className="text-sm text-muted-foreground">Redirect all HTTP traffic to HTTPS</p>
                </div>
                <Switch id="force-ssl" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" defaultValue="60" type="number" min="5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger id="password-policy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (min 8 characters)</SelectItem>
                    <SelectItem value="medium">Medium (min 8 chars, 1 number, 1 uppercase)</SelectItem>
                    <SelectItem value="strong">Strong (min 10 chars, 1 number, 1 uppercase, 1 special)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="captcha">CAPTCHA Protection</Label>
                  <p className="text-sm text-muted-foreground">Enable CAPTCHA on forms to prevent spam</p>
                </div>
                <Switch id="captcha" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-blocking">IP Blocking</Label>
                <Textarea id="ip-blocking" placeholder="Enter IP addresses to block, one per line" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Configure your data backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Schedule regular backups of your data</p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                <Input id="backup-retention" defaultValue="30" type="number" min="1" />
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="outline" className="flex-1">
                  Create Backup Now
                </Button>
                <Button variant="outline" className="flex-1">
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
