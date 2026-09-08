// Wallet addresses for deposits - INVESTMENT HOLDINGS, LLC official wallets
export const walletAddresses = {
  BTC: {
    address: "13hCSmBajWnPE7ifB9PsDqhrNXivbttSdM",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Network",
    icon: "bitcoin",
    color: "orange",
    minDeposit: 0.0001,
    confirmations: 3,
  },
  USDT: {
    address: "0x8e39969df6ca6a63e7f610748432d413f27b82ce",
    name: "Tether",
    symbol: "USDT",
    network: "ERC-20 (Ethereum)",
    icon: "usdt",
    color: "emerald",
    minDeposit: 10,
    confirmations: 12,
  },
  LTC: {
    address: "LfWv96xYwY5s2Qn7Yia3jAhCEQRbjK5AyJ",
    name: "Litecoin",
    symbol: "LTC",
    network: "Litecoin Network",
    icon: "litecoin",
    color: "slate",
    minDeposit: 0.01,
    confirmations: 6,
  },
}

export type CryptoKey = keyof typeof walletAddresses
