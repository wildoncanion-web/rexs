"use client"

import type React from "react"

import { walletAddresses, type CryptoKey } from "@/lib/wallet-addresses"
import { Bitcoin } from "lucide-react"

interface CryptoSelectorProps {
  selectedCrypto: CryptoKey
  onSelect: (crypto: CryptoKey) => void
}

const cryptoIcons: Record<CryptoKey, React.ComponentType<{ className?: string }>> = {
  BTC: Bitcoin,
  USDT: () => (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
      ₮
    </div>
  ),
  LTC: () => (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white">
      Ł
    </div>
  ),
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  orange: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500" },
  slate: { bg: "bg-slate-400/10", text: "text-slate-400", border: "border-slate-400" },
}

export function CryptoSelector({ selectedCrypto, onSelect }: CryptoSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.keys(walletAddresses) as CryptoKey[]).map((key) => {
        const crypto = walletAddresses[key]
        const Icon = cryptoIcons[key]
        const colors = colorClasses[crypto.color]
        const isSelected = selectedCrypto === key

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              isSelected ? `${colors.border} ${colors.bg}` : "border-border bg-secondary/50 hover:bg-secondary"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{crypto.symbol}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
