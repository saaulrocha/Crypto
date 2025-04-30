import type { CoinData, HistoricalData } from "./types"

const API_BASE_URL = "https://api.coingecko.com/api/v3"

// Datos de respaldo para cuando la API falla
const FALLBACK_COINS: CoinData[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 52387.12,
    market_cap: 1028762329827,
    market_cap_rank: 1,
    fully_diluted_valuation: 1100762329827,
    total_volume: 28762329827,
    high_24h: 53000.12,
    low_24h: 51500.34,
    price_change_24h: 887.12,
    price_change_percentage_24h: 1.72,
    price_change_percentage_7d_in_currency: 5.24,
    market_cap_change_24h: 17762329827,
    market_cap_change_percentage_24h: 1.75,
    circulating_supply: 19000000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -24.12,
    ath_date: "2021-11-10T14:24:11.849Z",
    atl: 67.81,
    atl_change_percentage: 77000.12,
    atl_date: "2013-07-06T00:00:00.000Z",
    last_updated: new Date().toISOString(),
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 2875.34,
    market_cap: 345762329827,
    market_cap_rank: 2,
    fully_diluted_valuation: 345762329827,
    total_volume: 15762329827,
    high_24h: 2900.12,
    low_24h: 2850.34,
    price_change_24h: 25.12,
    price_change_percentage_24h: 0.88,
    price_change_percentage_7d_in_currency: 3.14,
    market_cap_change_24h: 5762329827,
    market_cap_change_percentage_24h: 0.92,
    circulating_supply: 120000000,
    total_supply: 120000000,
    max_supply: null,
    ath: 4878.26,
    ath_change_percentage: -41.12,
    ath_date: "2021-11-10T14:24:11.849Z",
    atl: 0.432979,
    atl_change_percentage: 663000.12,
    atl_date: "2015-10-20T00:00:00.000Z",
    last_updated: new Date().toISOString(),
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    current_price: 0.45,
    market_cap: 15762329827,
    market_cap_rank: 8,
    fully_diluted_valuation: 20762329827,
    total_volume: 762329827,
    high_24h: 0.46,
    low_24h: 0.44,
    price_change_24h: 0.01,
    price_change_percentage_24h: 2.25,
    price_change_percentage_7d_in_currency: -1.14,
    market_cap_change_24h: 262329827,
    market_cap_change_percentage_24h: 2.32,
    circulating_supply: 35000000000,
    total_supply: 45000000000,
    max_supply: 45000000000,
    ath: 3.09,
    ath_change_percentage: -85.12,
    ath_date: "2021-09-02T06:00:10.474Z",
    atl: 0.01925275,
    atl_change_percentage: 2237.12,
    atl_date: "2020-03-13T02:22:55.044Z",
    last_updated: new Date().toISOString(),
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 145.23,
    market_cap: 62762329827,
    market_cap_rank: 5,
    fully_diluted_valuation: 80762329827,
    total_volume: 3762329827,
    high_24h: 148.12,
    low_24h: 142.34,
    price_change_24h: 3.12,
    price_change_percentage_24h: 2.19,
    price_change_percentage_7d_in_currency: 8.24,
    market_cap_change_24h: 1762329827,
    market_cap_change_percentage_24h: 2.25,
    circulating_supply: 430000000,
    total_supply: 550000000,
    max_supply: null,
    ath: 259.96,
    ath_change_percentage: -44.12,
    ath_date: "2021-11-06T21:54:35.825Z",
    atl: 0.5,
    atl_change_percentage: 28900.12,
    atl_date: "2020-05-11T19:35:23.449Z",
    last_updated: new Date().toISOString(),
  },
  {
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    current_price: 14.52,
    market_cap: 9544880000,
    market_cap_rank: 15,
    fully_diluted_valuation: 14544880000,
    total_volume: 762329827,
    high_24h: 15.12,
    low_24h: 14.34,
    price_change_24h: -0.65,
    price_change_percentage_24h: -4.33,
    price_change_percentage_7d_in_currency: -2.14,
    market_cap_change_24h: -462329827,
    market_cap_change_percentage_24h: -4.62,
    circulating_supply: 650000000,
    total_supply: 1000000000,
    max_supply: 1000000000,
    ath: 52.7,
    ath_change_percentage: -72.12,
    ath_date: "2021-05-10T00:13:57.214Z",
    atl: 0.1263,
    atl_change_percentage: 11400.12,
    atl_date: "2017-11-29T00:00:00.000Z",
    last_updated: new Date().toISOString(),
  },
  {
    id: "avalanche",
    symbol: "avax",
    name: "Avalanche",
    image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    current_price: 21.56,
    market_cap: 8762329827,
    market_cap_rank: 16,
    fully_diluted_valuation: 15762329827,
    total_volume: 562329827,
    high_24h: 22.12,
    low_24h: 21.34,
    price_change_24h: -0.61,
    price_change_percentage_24h: -2.75,
    price_change_percentage_7d_in_currency: -5.14,
    market_cap_change_24h: -262329827,
    market_cap_change_percentage_24h: -2.92,
    circulating_supply: 400000000,
    total_supply: 720000000,
    max_supply: 720000000,
    ath: 144.96,
    ath_change_percentage: -85.12,
    ath_date: "2021-11-21T14:18:56.538Z",
    atl: 2.8,
    atl_change_percentage: 670.12,
    atl_date: "2020-12-31T13:15:21.540Z",
    last_updated: new Date().toISOString(),
  },
]

// Datos de respaldo para el historial de precios
const generateFallbackHistory = (days: string, basePrice: number): HistoricalData[] => {
  const now = new Date()
  const daysNum = Number.parseInt(days)
  const data: HistoricalData[] = []

  // Generar datos históricos simulados
  for (let i = daysNum; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Añadir algo de variación aleatoria al precio
    const randomFactor = 0.05 // 5% de variación máxima
    const randomChange = (Math.random() * 2 - 1) * randomFactor
    const price = basePrice * (1 + randomChange * (i / daysNum))

    data.push({
      date: date.toISOString(),
      price: price,
    })
  }

  return data
}

export async function fetchCoins(): Promise<CoinData[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d`,
      { signal: controller.signal },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`API respondió con estado: ${response.status}. Usando datos de respaldo.`)
      return FALLBACK_COINS
    }

    return response.json()
  } catch (error) {
    console.warn(`Error al obtener datos de la API: ${error}. Usando datos de respaldo.`)
    return FALLBACK_COINS
  }
}

export async function fetchCoinHistory(coinId: string, days: string): Promise<HistoricalData[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    const response = await fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`API respondió con estado: ${response.status}. Usando datos de respaldo para historial.`)
      // Encontrar el precio base para este coin en los datos de respaldo
      const coin = FALLBACK_COINS.find((c) => c.id === coinId)
      const basePrice = coin ? coin.current_price : 100 // Precio por defecto si no se encuentra
      return generateFallbackHistory(days, basePrice)
    }

    const data = await response.json()

    // Transform the data for the chart
    return data.prices.map((item: [number, number]) => ({
      date: new Date(item[0]).toISOString(),
      price: item[1],
    }))
  } catch (error) {
    console.warn(`Error al obtener historial de la API: ${error}. Usando datos de respaldo.`)
    // Encontrar el precio base para este coin en los datos de respaldo
    const coin = FALLBACK_COINS.find((c) => c.id === coinId)
    const basePrice = coin ? coin.current_price : 100 // Precio por defecto si no se encuentra
    return generateFallbackHistory(days, basePrice)
  }
}
