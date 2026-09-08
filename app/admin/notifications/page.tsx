"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, query, orderBy, where, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, UserPlus, ArrowUpFromLine, ArrowDownToLine, CheckCircle, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"
import { formatUSDateTime } from "@/lib/date"

interface Notification {
  id: string
  type: "signup" | "withdrawal_otp_request" | "withdrawal_confirmed" | "deposit"
  userId: string
  userEmail: string
  userName?: string
  amount?: number
  crypto?: string
  walletAddress?: string
  withdrawalId?: string
  read: boolean
  createdAt: { seconds: number }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const fetchNotifications = async () => {
    const db = getFirebaseDb()
    const q = query(collection(db, "admin_notifications"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Notification[]
    setNotifications(data)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    const db = getFirebaseDb()
    await updateDoc(doc(db, "admin_notifications", notificationId), {
      read: true,
      readAt: Timestamp.now(),
    })
    fetchNotifications()
  }

  const handleMarkAllAsRead = async () => {
    const db = getFirebaseDb()
    const unreadNotifications = notifications.filter((n) => !n.read)
    for (const notif of unreadNotifications) {
      await updateDoc(doc(db, "admin_notifications", notif.id), {
        read: true,
        readAt: Timestamp.now(),
      })
    }
    fetchNotifications()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "signup":
        return <UserPlus className="h-5 w-5 text-emerald-500" />
      case "withdrawal_otp_request":
        return <ArrowUpFromLine className="h-5 w-5 text-amber-500" />
      case "withdrawal_confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "deposit":
        return <ArrowDownToLine className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-zinc-500" />
    }
  }

  const getNotificationTitle = (notif: Notification) => {
    switch (notif.type) {
      case "signup":
        return "New User Registration"
      case "withdrawal_otp_request":
        return "Withdrawal OTP Required"
      case "withdrawal_confirmed":
        return "Withdrawal OTP Verified"
      case "deposit":
        return "New Deposit"
      default:
        return "Notification"
    }
  }

  const getNotificationDescription = (notif: Notification) => {
    switch (notif.type) {
      case "signup":
        return `${notif.userName || notif.userEmail} has registered a new account.`
      case "withdrawal_otp_request":
        return `${notif.userName || notif.userEmail} requested withdrawal of ${notif.amount} ${notif.crypto}. Generate OTP to proceed.`
      case "withdrawal_confirmed":
        return `${notif.userName || notif.userEmail} verified OTP for ${notif.amount} ${notif.crypto} withdrawal.`
      case "deposit":
        return `${notif.userName || notif.userEmail} made a deposit of ${notif.amount} ${notif.crypto}.`
      default:
        return "New notification received."
    }
  }

  const getNotificationAction = (notif: Notification) => {
    switch (notif.type) {
      case "signup":
        return (
          <Link href="/admin/users">
            <Button size="sm" variant="outline" className="border-zinc-700 bg-transparent">
              View Users
            </Button>
          </Link>
        )
      case "withdrawal_otp_request":
        return (
          <Link href="/admin/withdrawals">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Generate OTP
            </Button>
          </Link>
        )
      case "withdrawal_confirmed":
        return (
          <Link href="/admin/withdrawals">
            <Button size="sm" variant="outline" className="border-zinc-700 bg-transparent">
              View Withdrawals
            </Button>
          </Link>
        )
      case "deposit":
        return (
          <Link href="/admin/deposits">
            <Button size="sm" variant="outline" className="border-zinc-700 bg-transparent">
              View Deposits
            </Button>
          </Link>
        )
      default:
        return null
    }
  }

  const filteredNotifications = filter === "unread" 
    ? notifications.filter((n) => !n.read)
    : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <AdminHeader 
        title="Notifications" 
        description="Stay updated on user activities and requests" 
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-emerald-600" : "border-zinc-700"}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
              className={filter === "unread" ? "bg-emerald-600" : "border-zinc-700"}
            >
              Unread ({unreadCount})
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchNotifications}
              variant="outline"
              className="border-zinc-700 gap-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="border-zinc-700 gap-2 bg-transparent"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`border-zinc-800 bg-zinc-900/50 transition-colors ${
                  !notif.read ? "border-l-4 border-l-emerald-500" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-zinc-800 p-2">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">
                          {getNotificationTitle(notif)}
                        </h3>
                        {!notif.read && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-2">
                        {getNotificationDescription(notif)}
                      </p>
                      {notif.walletAddress && (
                        <p className="text-xs text-zinc-500 mb-2 font-mono">
                          Wallet: {notif.walletAddress.slice(0, 16)}...{notif.walletAddress.slice(-8)}
                        </p>
                      )}
                      <p className="text-xs text-zinc-600">
                        {formatUSDateTime(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getNotificationAction(notif)}
                      {!notif.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-zinc-500 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
