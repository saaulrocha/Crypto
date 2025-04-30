import type { CoinData, HistoricalData } from "./types"

const API_BASE_URL = "https://api.coingecko.com/api/v3"

export async function fetchCoins(): Promise<CoinData[]> {
  const response = await fetch(
    `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch coins: ${response.status}`)
  }

  return response.json()
}

export async function fetchCoinHistory(coinId: string, days: string): Promise<HistoricalData[]> {
  const response = await fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch coin history: ${response.status}`)
  }

  const data = await response.json()

  // Transform the data for the chart
  return data.prices.map((item: [number, number]) => ({
    date: new Date(item[0]).toISOString(),
    price: item[1],
  }))
}
