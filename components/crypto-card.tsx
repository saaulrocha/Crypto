"use client"

import type React from "react"

import { Star } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { CoinData } from "@/lib/types"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface CryptoCardProps {
  coin: CoinData
  isFavorite: boolean
  onToggleFavorite: (coinId: string) => void
  onSelect: (coin: CoinData) => void
}

export function CryptoCard({ coin, isFavorite, onToggleFavorite, onSelect }: CryptoCardProps) {
  const priceChangeColor = coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(coin.id)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={() => onSelect(coin)}>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <img src={coin.image || "/placeholder.svg"} alt={`Logo de ${coin.name}`} className="h-8 w-8 rounded-full" />
          <div>
            <h3 className="font-semibold">{coin.name}</h3>
            <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
          </div>
        </div>
        <button
          onClick={handleFavoriteClick}
          className="text-muted-foreground hover:text-primary focus:outline-none"
          aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          <Star className={`h-5 w-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "fill-none"}`} />
        </button>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="mt-2 grid gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Precio</span>
            <span className="font-medium">{formatCurrency(coin.current_price)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Cambio 24h</span>
            <span className={`font-medium ${priceChangeColor}`}>
              {formatPercentage(coin.price_change_percentage_24h)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Cap. de mercado</span>
            <span className="font-medium">{formatCurrency(coin.market_cap, true)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
