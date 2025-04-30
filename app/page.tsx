"use client"

import { useEffect, useState } from "react"
import { Menu, Search } from "lucide-react"
import Link from "next/link"

import { CryptoCard } from "@/components/crypto-card"
import { DetailedView } from "@/components/detailed-view"
import { FilterSortBar, type FilterOption, type SortOption } from "@/components/filter-sort-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Watermark } from "@/components/watermark"
import { CryptoCardSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { fetchCoins } from "@/lib/api"
import type { CoinData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedSort, setSelectedSort] = useState<SortOption>({
    value: "market_cap_desc",
    label: "Cap. de mercado (Mayor a menor)",
    direction: "desc",
  })
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>({
    value: "all",
    label: "Todas las monedas",
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true)
        const data = await fetchCoins()
        setCoins(data)
        toast({
          title: "Datos actualizados",
          description: "Los precios de las criptomonedas han sido actualizados",
          variant: "default",
          duration: 3000,
        })
      } catch (error) {
        console.error("Error al cargar monedas:", error)
        toast({
          title: "Error al cargar datos",
          description: "Se están mostrando datos de respaldo debido a un problema de conexión",
          variant: "destructive",
        })
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
  }, [toast])

  const toggleFavorite = (coinId: string) => {
    const newFavorites = favorites.includes(coinId) ? favorites.filter((id) => id !== coinId) : [...favorites, coinId]

    setFavorites(newFavorites)
    localStorage.setItem("cryptoFavorites", JSON.stringify(newFavorites))
  }

  const handleSortChange = (option: SortOption) => {
    setSelectedSort(option)
  }

  const handleFilterChange = (option: FilterOption) => {
    setSelectedFilter(option)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  // Aplicar filtros
  let filteredCoins = [...coins]

  // Filtrar por búsqueda
  if (searchQuery) {
    filteredCoins = filteredCoins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  // Aplicar filtros adicionales
  if (selectedFilter.value === "top_100") {
    filteredCoins = filteredCoins.filter((coin) => coin.market_cap_rank <= 100)
  } else if (selectedFilter.value === "gainers") {
    filteredCoins = filteredCoins.filter((coin) => coin.price_change_percentage_24h > 0)
  } else if (selectedFilter.value === "losers") {
    filteredCoins = filteredCoins.filter((coin) => coin.price_change_percentage_24h < 0)
  }

  // Aplicar ordenación
  filteredCoins.sort((a, b) => {
    const direction = selectedSort.direction === "asc" ? 1 : -1

    if (selectedSort.value.includes("market_cap")) {
      return (a.market_cap - b.market_cap) * direction
    } else if (selectedSort.value.includes("volume")) {
      return (a.total_volume - b.total_volume) * direction
    } else if (selectedSort.value.includes("price_change_24h")) {
      return (a.price_change_percentage_24h - b.price_change_percentage_24h) * direction
    }

    return 0
  })

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin)
  }

  const handleCloseDetailedView = () => {
    setSelectedCoin(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="navbar-blur sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <div className="py-4">
                  <h2 className="mb-4 text-lg font-semibold">Menú</h2>
                  <nav className="flex flex-col gap-2">
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/">Inicio</Link>
                    </Button>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/portfolio">Portafolio</Link>
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-primary">
              Panel de Criptomonedas
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-[120px] pl-8 md:w-[200px] lg:w-[300px] rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button asChild variant="outline" className="rounded-full hidden sm:flex">
              <Link href="/portfolio">Portafolio</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6 relative z-10">
        <FilterSortBar
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <CryptoCardSkeleton key={index} />
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
