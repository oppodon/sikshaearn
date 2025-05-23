"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Download,
  Filter,
  Eye,
  Reply,
  Archive,
  Trash2,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied" | "archived"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  repliedAt?: string
  reply?: string
}

interface ContactStats {
  total: number
  unread: number
  replied: number
  archived: number
  today: number
}

export default function ContactMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({ total: 0, unread: 0, replied: 0, archived: 0, today: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [replyText, setReplyText] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchStats()
  }, [activeTab])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/contacts/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const status = activeTab === "all" ? "" : activeTab
      const response = await fetch(`/api/contact?status=${status}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error("Failed to fetch contacts")
    } finally {
      setLoading(false)
    }
  }

  const updateContactStatus = async (contactId: string, status: string, reply?: string) => {
    try {
      setIsReplying(true)
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reply }),
      })

      if (response.ok) {
        toast.success(reply ? "Reply sent successfully!" : "Status updated successfully!")
        fetchContacts()
        fetchStats()
        setSelectedContact(null)
        setReplyText("")
      } else {
        toast.error("Failed to update contact")
      }
    } catch (error) {
      console.error("Error updating contact:", error)
      toast.error("Failed to update contact")
    } finally {
      setIsReplying(false)
    }
  }

  const deleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Contact deleted successfully!")
        fetchContacts()
        fetchStats()
      } else {
        toast.error("Failed to delete contact")
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast.error("Failed to delete contact")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      unread: { variant: "destructive" as const, icon: AlertCircle },
      read: { variant: "secondary" as const, icon: Eye },
      replied: { variant: "default" as const, icon: CheckCircle },
      archived: { variant: "outline" as const, icon: Archive },
    }
    const config = variants[status as keyof typeof variants]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    }
    return <Badge className={`${colors[priority as keyof typeof colors]} border`}>{priority}</Badge>
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-gray-600 mt-1">Manage customer inquiries and support requests</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="w-full bg-background pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Messages ({stats.total})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
          <TabsTrigger value="replied">Replied ({stats.replied})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({stats.archived})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" && "All Contact Messages"}
                {activeTab === "unread" && "Unread Messages"}
                {activeTab === "replied" && "Replied Messages"}
                {activeTab === "archived" && "Archived Messages"}
              </CardTitle>
              <CardDescription>
                {activeTab === "unread" && "Messages that require your attention"}
                {activeTab === "replied" && "Messages that have been responded to"}
                {activeTab === "archived" && "Messages that have been archived"}
                {activeTab === "all" && "Manage all customer inquiries and support requests"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No messages found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContacts.map((contact) => (
                        <TableRow key={contact._id} className={contact.status === "unread" ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell className="max-w-xs truncate">{contact.subject}</TableCell>
                          <TableCell>{format(new Date(contact.createdAt), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{getStatusBadge(contact.status)}</TableCell>
                          <TableCell>{getPriorityBadge(contact.priority)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedContact(contact)
                                      if (contact.status === "unread") {
                                        updateContactStatus(contact._id, "read")
                                      }
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Message Details</DialogTitle>
                                    <DialogDescription>
                                      From {contact.name} ({contact.email})
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Subject</h4>
                                      <p className="text-sm text-gray-600">{contact.subject}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Message</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.message}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {format(new Date(contact.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                                      </div>
                                      <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {getStatusBadge(contact.status)}
                                      </div>
                                    </div>

                                    {contact.reply && (
                                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h4 className="font-medium mb-2 text-blue-900 flex items-center">
                                          <Reply className="h-4 w-4 mr-2" />
                                          Your Reply
                                        </h4>
                                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{contact.reply}</p>
                                        {contact.repliedAt && (
                                          <p className="text-xs text-blue-600 mt-2">
                                            Replied on {format(new Date(contact.repliedAt), "MMM dd, yyyy 'at' HH:mm")}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="font-medium mb-2">Reply to this message</h4>
                                      <Textarea
                                        placeholder="Type your reply here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="min-h-[100px]"
                                        disabled={isReplying}
                                      />
                                      <div className="flex justify-end space-x-2 mt-4">
                                        <Button
                                          variant="outline"
                                          onClick={() => updateContactStatus(contact._id, "archived")}
                                          disabled={isReplying}
                                        >
                                          <Archive className="h-4 w-4 mr-2" />
                                          Archive
                                        </Button>
                                        <Button
                                          onClick={() => updateContactStatus(contact._id, "replied", replyText)}
                                          disabled={!replyText.trim() || isReplying}
                                        >
                                          {isReplying ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <Reply className="h-4 w-4 mr-2" />
                                              Send Reply
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContact(contact._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
