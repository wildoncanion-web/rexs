"use client"

import type React from "react"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { walletAddresses, type CryptoKey } from "@/lib/wallet-addresses"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ExternalLink } from "lucide-react"
import { Bitcoin } from "lucide-react"

const cryptoIcons: Record<string, React.ReactNode> = {
  BTC: <Bitcoin className="h-6 w-6 text-orange-500" />,
  USDT: (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
      ₮
    </div>
  ),
  LTC: (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-xs font-bold text-white">
      Ł
    </div>
  ),
}

export default function AdminWalletsPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [editedAddresses, setEditedAddresses] = useState<Record<string, string>>({})

  const handleCopy = (address: string, key: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(key)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleAddressChange = (key: CryptoKey, value: string) => {
    setEditedAddresses((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <AdminHeader title="Wallet Addresses" description="Manage deposit wallet addresses for each cryptocurrency" />

      <div className="p-6">
        <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400">
            <strong>Note:</strong> To permanently change wallet addresses, update the{" "}
            <code className="rounded bg-zinc-800 px-1">lib/wallet-addresses.ts</code> file in your codebase and
            redeploy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {(Object.keys(walletAddresses) as CryptoKey[]).map((key) => {
            const wallet = walletAddresses[key]
            const currentAddress = editedAddresses[key] || wallet.address

            return (
              <Card
                key={key}
                className="border-emerald-500/20 bg-zinc-900/50 transition-all hover:border-emerald-500/40"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-white">
                    {cryptoIcons[key]}
                    <div>
                      <span>{wallet.name}</span>
                      <p className="text-sm font-normal text-zinc-500">{wallet.network}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentAddress}
                        onChange={(e) => handleAddressChange(key, e.target.value)}
                        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-white"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 border-zinc-700 hover:bg-zinc-800 bg-transparent"
                        onClick={() => handleCopy(currentAddress, key)}
                      >
                        {copiedAddress === key ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500">Min Deposit</p>
                      <p className="font-medium text-white">
                        {wallet.minDeposit} {wallet.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Confirmations</p>
                      <p className="font-medium text-white">{wallet.confirmations}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white bg-transparent"
                    onClick={() =>
                      window.open(
                        key === "BTC"
                          ? `https://blockchair.com/bitcoin/address/${currentAddress}`
                          : key === "LTC"
                            ? `https://blockchair.com/litecoin/address/${currentAddress}`
                            : `https://etherscan.io/address/${currentAddress}`,
                        "_blank",
                      )
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
