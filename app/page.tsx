"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"

import { CryptoCard } from "@/components/crypto-card"
import { DetailedView } from "@/components/detailed-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { Watermark } from "@/components/watermark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchCoins } from "@/lib/api"
import type { CoinData } from "@/lib/types"

export default function Dashboard() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const data = await fetchCoins()
        setCoins(data)
      } catch (error) {
        console.error("Error al cargar monedas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCoins()

    // Cargar favoritos desde localStorage
    const savedFavorites = localStorage.getItem("cryptoFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Configurar intervalo para actualizar datos
    const interval = setInterval(loadCoins, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [])

  const toggleFavorite = (coinId: string) => {
    const newFavorites = favorites.includes(coinId) ? favorites.filter((id) => id !== coinId) : [...favorites, coinId]

    setFavorites(newFavorites)
    localStorage.setItem("cryptoFavorites", JSON.stringify(newFavorites))
  }

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin)
  }

  const handleCloseDetailedView = () => {
    setSelectedCoin(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold tracking-tight">Panel de Criptomonedas</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar monedas..."
                className="w-[200px] pl-8 md:w-[260px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button asChild variant="outline">
              <Link href="/portfolio">Portafolio</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-[180px] rounded-lg bg-muted/60 p-4 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {favorites.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Favoritos</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {coins
                    .filter((coin) => favorites.includes(coin.id))
                    .map((coin) => (
                      <CryptoCard
                        key={coin.id}
                        coin={coin}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onSelect={handleCoinSelect}
                      />
                    ))}
                </div>
              </div>
            )}

            <h2 className="mb-4 text-xl font-semibold">Todas las Criptomonedas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCoins.map((coin) => (
                <CryptoCard
                  key={coin.id}
                  coin={coin}
                  isFavorite={favorites.includes(coin.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={handleCoinSelect}
                />
              ))}
            </div>

            {filteredCoins.length === 0 && (
              <div className="mt-8 text-center text-muted-foreground">
                No se encontraron criptomonedas que coincidan con tu búsqueda.
              </div>
            )}
          </>
        )}
      </main>

      {selectedCoin && <DetailedView coin={selectedCoin} onClose={handleCloseDetailedView} />}
      <Watermark />
    </div>
  )
}
