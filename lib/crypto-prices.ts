/**
 * Reference USD prices used to convert between crypto holdings and their dollar value.
 * Update these when market prices move significantly — they are not fetched live.
 */
export const CRYPTO_USD_PRICES: Record<string, number> = {
  BTC: 65000,
  ETH: 3400,
  USDC: 1,
  USDT: 1,
  LTC: 95,
  DOGE: 0.12,
}

export function getCryptoPrice(crypto: string): number {
  return CRYPTO_USD_PRICES[crypto] ?? 0
}

/** Converts a crypto amount (e.g. 0.05 BTC) into its USD value. */
export function cryptoToUsd(crypto: string, amount: number): number {
  return amount * getCryptoPrice(crypto)
}

/** Converts a USD amount into the equivalent amount of the given crypto. */
export function usdToCrypto(crypto: string, usdAmount: number): number {
  const price = getCryptoPrice(crypto)
  return price > 0 ? usdAmount / price : 0
}

/** Sums the USD value of a full holdings record across all coins. */
export function holdingsToUsd(holdings: Record<string, number> | undefined): number {
  if (!holdings) return 0
  return Object.entries(holdings).reduce((total, [crypto, amount]) => total + cryptoToUsd(crypto, amount || 0), 0)
}

export function formatCryptoAmount(crypto: string, amount: number): string {
  const decimals = crypto === "BTC" || crypto === "LTC" || crypto === "ETH" ? 8 : 2
  return `${amount.toFixed(decimals)} ${crypto}`
}
