export interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number | null
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

export interface HistoricalData {
  date: string
  price: number
}

export interface Transaction {
  id: string
  coinId: string
  type: "buy" | "sell"
  amount: number
  price: number
  date: string
}

export interface PortfolioHolding {
  coinId: string
  amount: number
  totalCost: number
  averageCost: number
  transactions: Transaction[]
}
