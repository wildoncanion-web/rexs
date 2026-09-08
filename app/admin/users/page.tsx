"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Search, DollarSign, Gift, ArrowDownToLine, CreditCard, Wallet, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cryptoToUsd, formatCryptoAmount, getCryptoPrice, holdingsToUsd } from "@/lib/crypto-prices"

const DEPOSIT_CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "USDT", label: "Tether (USDT - ERC20)" },
  { value: "LTC", label: "Litecoin (LTC)" },
]

interface UserData {
  uid: string
  email: string
  displayName: string
  totalBalance: number
  availableBalance: number
  credits: number
  bonus: number
  profit: number
  holdings: {
    BTC: number
    ETH: number
    USDC: number
    USDT: number
    LTC: number
    DOGE: number
  }
  createdAt: { seconds: number }
  status: "active" | "suspended" | "pending"
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [actionType, setActionType] = useState<"edit" | "deposit" | "bonus" | "credit" | "profit">("edit")
  const [actionAmount, setActionAmount] = useState("")
  const [actionCrypto, setActionCrypto] = useState("USDT")
  const [actionNote, setActionNote] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: "",
    totalBalance: 0,
    availableBalance: 0,
    credits: 0,
    bonus: 0,
    profit: 0,
    status: "active" as "active" | "suspended" | "pending",
    BTC: 0,
    ETH: 0,
    USDC: 0,
    USDT: 0,
    LTC: 0,
    DOGE: 0,
  })

  const fetchUsers = async () => {
    const db = getFirebaseDb()
    const usersSnapshot = await getDocs(collection(db, "users"))
    const usersData = usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as UserData[]
    setUsers(usersData)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setActionType("edit")
    setEditForm({
      displayName: user.displayName || "",
      totalBalance: user.totalBalance || 0,
      availableBalance: user.availableBalance || 0,
      credits: user.credits || 0,
      bonus: user.bonus || 0,
      profit: user.profit || 0,
      status: user.status || "active",
      BTC: user.holdings?.BTC || 0,
      ETH: user.holdings?.ETH || 0,
      USDC: user.holdings?.USDC || 0,
      USDT: user.holdings?.USDT || 0,
      LTC: user.holdings?.LTC || 0,
      DOGE: user.holdings?.DOGE || 0,
    })
    setDialogOpen(true)
  }

  const handleQuickAction = (user: UserData, type: "deposit" | "bonus" | "credit" | "profit") => {
    setEditingUser(user)
    setActionType(type)
    setActionAmount("")
    setActionCrypto("USDT")
    setActionNote("")
    setDialogOpen(true)
  }

  // Total balance is always derived from crypto holdings' USD value plus credits, bonus, and profit —
  // it is never entered directly, so it can't drift from what the user actually holds.
  const computedTotalBalance =
    holdingsToUsd({
      BTC: editForm.BTC,
      ETH: editForm.ETH,
      USDC: editForm.USDC,
      USDT: editForm.USDT,
      LTC: editForm.LTC,
      DOGE: editForm.DOGE,
    }) +
    editForm.credits +
    editForm.bonus +
    editForm.profit

  const handleSave = async () => {
    if (!editingUser) return
    const db = getFirebaseDb()

    try {
      // Track changes for transaction records
      const oldCredits = editingUser.credits || 0
      const oldBonus = editingUser.bonus || 0
      const oldProfit = editingUser.profit || 0
      const oldTotalBalance = editingUser.totalBalance || 0

      await updateDoc(doc(db, "users", editingUser.uid), {
        displayName: editForm.displayName,
        totalBalance: computedTotalBalance,
        availableBalance: editForm.availableBalance,
        credits: editForm.credits,
        bonus: editForm.bonus,
        profit: editForm.profit,
        status: editForm.status,
        holdings: {
          BTC: editForm.BTC,
          ETH: editForm.ETH,
          USDC: editForm.USDC,
          USDT: editForm.USDT,
          LTC: editForm.LTC,
          DOGE: editForm.DOGE,
        },
      })

      // Create transaction records for changes
      if (editForm.credits !== oldCredits) {
        const diff = editForm.credits - oldCredits
        await addDoc(collection(db, "transactions"), {
          userId: editingUser.uid,
          userEmail: editingUser.email,
          type: "credit",
          amount: Math.abs(diff),
          description: diff > 0 ? "Credit added by admin" : "Credit removed by admin",
          status: "completed",
          createdAt: Timestamp.now(),
        })
      }

      if (editForm.bonus !== oldBonus) {
        const diff = editForm.bonus - oldBonus
        await addDoc(collection(db, "transactions"), {
          userId: editingUser.uid,
          userEmail: editingUser.email,
          type: "bonus",
          amount: Math.abs(diff),
          description: diff > 0 ? "Bonus added by admin" : "Bonus removed by admin",
          status: "completed",
          createdAt: Timestamp.now(),
        })
      }

      if (editForm.profit !== oldProfit) {
        const diff = editForm.profit - oldProfit
        await addDoc(collection(db, "transactions"), {
          userId: editingUser.uid,
          userEmail: editingUser.email,
          type: "profit",
          amount: Math.abs(diff),
          description: diff > 0 ? "Profit added by admin" : "Profit adjusted by admin",
          status: "completed",
          createdAt: Timestamp.now(),
        })
      }

      if (computedTotalBalance !== oldTotalBalance) {
        const diff = computedTotalBalance - oldTotalBalance
        await addDoc(collection(db, "transactions"), {
          userId: editingUser.uid,
          userEmail: editingUser.email,
          type: diff > 0 ? "deposit" : "withdrawal",
          amount: Math.abs(diff),
          description: "Balance adjusted by admin",
          status: "completed",
          createdAt: Timestamp.now(),
        })
      }

    } catch (error) {
      console.error("Error saving user:", error)
      alert("Failed to save user. Please try again.")
      return
    }

    setDialogOpen(false)
    setEditingUser(null)
    fetchUsers()
  }

  const handleQuickActionSave = async () => {
    if (!editingUser || !actionAmount) return
    const db = getFirebaseDb()
    const amount = Number.parseFloat(actionAmount)

    if (actionType === "deposit") {
      // Amount is the crypto amount received (e.g. 0.05 BTC), converted to USD using the reference price
      const usdValue = cryptoToUsd(actionCrypto, amount)

      await addDoc(collection(db, "deposits"), {
        userId: editingUser.uid,
        userEmail: editingUser.email,
        amount: amount,
        crypto: actionCrypto,
        usdValue,
        status: "confirmed",
        note: actionNote || "Admin deposit",
        createdAt: Timestamp.now(),
        confirmedAt: Timestamp.now(),
        confirmedBy: "admin",
      })

      const newHoldings = { ...editingUser.holdings }
      newHoldings[actionCrypto as keyof typeof newHoldings] =
        (newHoldings[actionCrypto as keyof typeof newHoldings] || 0) + amount

      await updateDoc(doc(db, "users", editingUser.uid), {
        totalBalance: (editingUser.totalBalance || 0) + usdValue,
        availableBalance: (editingUser.availableBalance || 0) + usdValue,
        holdings: newHoldings,
      })

      // Add transaction record
      await addDoc(collection(db, "transactions"), {
        userId: editingUser.uid,
        userEmail: editingUser.email,
        type: "deposit",
        amount: usdValue,
        cryptoAmount: amount,
        crypto: actionCrypto,
        description: actionNote || `Admin deposit — ${formatCryptoAmount(actionCrypto, amount)}`,
        createdAt: Timestamp.now(),
      })
    } else if (actionType === "bonus") {
      await updateDoc(doc(db, "users", editingUser.uid), {
        bonus: (editingUser.bonus || 0) + amount,
        totalBalance: (editingUser.totalBalance || 0) + amount,
      })

      await addDoc(collection(db, "transactions"), {
        userId: editingUser.uid,
        userEmail: editingUser.email,
        type: "bonus",
        amount: amount,
        description: actionNote || "Admin bonus",
        createdAt: Timestamp.now(),
      })
    } else if (actionType === "credit") {
      await updateDoc(doc(db, "users", editingUser.uid), {
        credits: (editingUser.credits || 0) + amount,
      })

      await addDoc(collection(db, "transactions"), {
        userId: editingUser.uid,
        userEmail: editingUser.email,
        type: "credit",
        amount: amount,
        description: actionNote || "Admin credit",
        createdAt: Timestamp.now(),
      })
    } else if (actionType === "profit") {
      // Amount is the crypto amount credited as profit, converted to USD using the reference price
      const usdValue = cryptoToUsd(actionCrypto, amount)

      const newHoldings = { ...editingUser.holdings }
      newHoldings[actionCrypto as keyof typeof newHoldings] =
        (newHoldings[actionCrypto as keyof typeof newHoldings] || 0) + amount

      await updateDoc(doc(db, "users", editingUser.uid), {
        profit: (editingUser.profit || 0) + usdValue,
        totalBalance: (editingUser.totalBalance || 0) + usdValue,
        availableBalance: (editingUser.availableBalance || 0) + usdValue,
        holdings: newHoldings,
      })

      await addDoc(collection(db, "transactions"), {
        userId: editingUser.uid,
        userEmail: editingUser.email,
        type: "profit",
        amount: usdValue,
        cryptoAmount: amount,
        crypto: actionCrypto,
        description: actionNote || `Investment profit — ${formatCryptoAmount(actionCrypto, amount)}`,
        createdAt: Timestamp.now(),
      })
    }

    setDialogOpen(false)
    setEditingUser(null)
    setActionAmount("")
    setActionNote("")
    fetchUsers()
  }

  const handleDelete = async (uid: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      const db = getFirebaseDb()
      await deleteDoc(doc(db, "users", uid))
      fetchUsers()
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <AdminHeader title="Users Management" description="Manage users, balances, deposits, credits and bonuses" />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-zinc-800 bg-zinc-900/50 pl-9 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400">
              {users.filter((u) => u.status === "active" || !u.status).length} Active
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400">
              {users.filter((u) => u.status === "pending").length} Pending
            </Badge>
            <Badge className="bg-red-500/20 text-red-400">
              {users.filter((u) => u.status === "suspended").length} Suspended
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">User</TableHead>
                <TableHead className="text-zinc-500">Balance</TableHead>
                <TableHead className="text-zinc-500">Credits</TableHead>
                <TableHead className="text-zinc-500">Bonus</TableHead>
                <TableHead className="text-zinc-500">Profit</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-right text-zinc-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{user.displayName || "N/A"}</p>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-400 font-medium">
                    <p>${(user.totalBalance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className="text-xs font-normal text-zinc-500">
                      {["BTC", "USDT", "LTC"]
                        .map((crypto) => {
                          const value = user.holdings?.[crypto as keyof typeof user.holdings] || 0
                          return value > 0 ? formatCryptoAmount(crypto, value) : null
                        })
                        .filter(Boolean)
                        .join(" · ") || "No crypto holdings"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sky-400">${(user.credits || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-amber-400">${(user.bonus || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-purple-400">${(user.profit || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.status === "suspended"
                          ? "bg-red-500/20 text-red-400"
                          : user.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                      }
                    >
                      {user.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => handleQuickAction(user, "deposit")}
                        title="Add Deposit"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        onClick={() => handleQuickAction(user, "bonus")}
                        title="Add Bonus"
                      >
                        <Gift className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                        onClick={() => handleQuickAction(user, "credit")}
                        title="Add Credit"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        onClick={() => handleQuickAction(user, "profit")}
                        title="Add Profit"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white"
                        onClick={() => handleEdit(user)}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(user.uid)}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-zinc-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "edit" && <Edit className="h-5 w-5 text-emerald-500" />}
              {actionType === "deposit" && <ArrowDownToLine className="h-5 w-5 text-emerald-500" />}
              {actionType === "bonus" && <Gift className="h-5 w-5 text-amber-500" />}
              {actionType === "credit" && <CreditCard className="h-5 w-5 text-sky-500" />}
              {actionType === "profit" && <TrendingUp className="h-5 w-5 text-purple-500" />}
              {actionType === "edit"
                ? `Edit User: ${editingUser?.email}`
                : actionType === "deposit"
                  ? `Add Deposit for ${editingUser?.displayName}`
                  : actionType === "bonus"
                    ? `Add Bonus for ${editingUser?.displayName}`
                    : actionType === "profit"
                      ? `Add Profit for ${editingUser?.displayName}`
                      : `Add Credit for ${editingUser?.displayName}`}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {actionType === "edit"
                ? "Manage all user details and balances"
                : actionType === "deposit"
                  ? "Add a deposit to the user's account"
                  : actionType === "bonus"
                    ? "Add a bonus to the user's account"
                    : actionType === "profit"
                      ? "Add investment profit to the user's account (withdrawable)"
                      : "Add credits to the user's account"}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "deposit" || actionType === "profit") && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
              Enter the amount in crypto units the user actually sent/earned. The dollar value is calculated
              automatically using the reference price for the selected coin.
            </div>
          )}

          {actionType === "edit" ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="balances">Balances</TabsTrigger>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Display Name</Label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Account Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm({ ...editForm, status: v as typeof editForm.status })}
                  >
                    <SelectTrigger className="border-zinc-800 bg-zinc-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-950">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="balances" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      Total Balance ($) — auto-calculated
                    </Label>
                    <Input
                      type="text"
                      readOnly
                      value={`$${computedTotalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                      className="border-zinc-800 bg-zinc-900/50 text-zinc-400"
                    />
                    <p className="text-xs text-zinc-500">Value of crypto holdings + credits + bonus + profit. Edit holdings below to change it.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-500" />
                      Available Balance ($)
                    </Label>
                    <Input
                      type="number"
                      value={editForm.availableBalance}
                      onChange={(e) => setEditForm({ ...editForm, availableBalance: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-sky-500" />
                      Credits ($)
                    </Label>
                    <Input
                      type="number"
                      value={editForm.credits}
                      onChange={(e) => setEditForm({ ...editForm, credits: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-amber-500" />
                      Bonus ($)
                    </Label>
                    <Input
                      type="number"
                      value={editForm.bonus}
                      onChange={(e) => setEditForm({ ...editForm, bonus: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-purple-400">Profit ($)</Label>
                  <Input
                    type="number"
                    value={editForm.profit}
                    onChange={(e) => setEditForm({ ...editForm, profit: Number(e.target.value) })}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
              </TabsContent>

              <TabsContent value="holdings" className="space-y-4 mt-4">
                <p className="text-xs text-zinc-500">
                  Enter each balance in the coin&apos;s own units. USD equivalents below use the reference prices in
                  lib/crypto-prices.ts.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-orange-400">BTC (Bitcoin)</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={editForm.BTC}
                      onChange={(e) => setEditForm({ ...editForm, BTC: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">≈ ${cryptoToUsd("BTC", editForm.BTC).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-indigo-400">ETH (Ethereum)</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={editForm.ETH}
                      onChange={(e) => setEditForm({ ...editForm, ETH: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">≈ ${cryptoToUsd("ETH", editForm.ETH).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-blue-400">USDC (USD Coin)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.USDC}
                      onChange={(e) => setEditForm({ ...editForm, USDC: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">≈ ${cryptoToUsd("USDC", editForm.USDC).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-emerald-400">USDT (Tether)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.USDT}
                      onChange={(e) => setEditForm({ ...editForm, USDT: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">≈ ${cryptoToUsd("USDT", editForm.USDT).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-400">LTC (Litecoin)</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={editForm.LTC}
                      onChange={(e) => setEditForm({ ...editForm, LTC: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">≈ ${cryptoToUsd("LTC", editForm.LTC).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-amber-400">DOGE (Dogecoin)</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={editForm.DOGE}
                      onChange={(e) => setEditForm({ ...editForm, DOGE: Number(e.target.value) })}
                      className="border-zinc-800 bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">≈ ${cryptoToUsd("DOGE", editForm.DOGE).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 py-4">
              {(actionType === "deposit" || actionType === "profit") && (
                <div className="grid gap-2">
                  <Label>Cryptocurrency</Label>
                  <Select value={actionCrypto} onValueChange={setActionCrypto}>
                    <SelectTrigger className="border-zinc-800 bg-zinc-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-950">
                      {DEPOSIT_CRYPTO_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label>{actionType === "deposit" || actionType === "profit" ? `Amount (${actionCrypto})` : "Amount ($)"}</Label>
                <Input
                  type="number"
                  step={actionType === "deposit" || actionType === "profit" ? "0.00000001" : "0.01"}
                  placeholder={actionType === "deposit" || actionType === "profit" ? "0.00000000" : "Enter amount"}
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="border-zinc-800 bg-zinc-900"
                />
                {(actionType === "deposit" || actionType === "profit") && actionAmount && !Number.isNaN(Number(actionAmount)) && (
                  <p className="text-xs text-zinc-500">
                    ≈ ${cryptoToUsd(actionCrypto, Number(actionAmount)).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                    at ${getCryptoPrice(actionCrypto).toLocaleString()} / {actionCrypto}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Note (optional)</Label>
                <Textarea
                  placeholder="Add a note for this transaction..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="border-zinc-800 bg-zinc-900 min-h-[80px]"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button
              onClick={actionType === "edit" ? handleSave : handleQuickActionSave}
              className={
                actionType === "bonus"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : actionType === "credit"
                    ? "bg-sky-600 hover:bg-sky-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              {actionType === "edit"
                ? "Save Changes"
                : actionType === "deposit"
                  ? "Add Deposit"
                  : actionType === "bonus"
                    ? "Add Bonus"
                    : "Add Credit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
