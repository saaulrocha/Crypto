"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCoinHistory } from "@/lib/api"
import type { CoinData, HistoricalData } from "@/lib/types"
import { formatCurrency, formatDate, formatNumber, formatPercentage } from "@/lib/utils"

interface DetailedViewProps {
  coin: CoinData
  onClose: () => void
}

export function DetailedView({ coin, onClose }: DetailedViewProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<string>("7")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistoricalData = async () => {
      setLoading(true)
      try {
        const data = await fetchCoinHistory(coin.id, timeframe)
        setHistoricalData(data)
      } catch (error) {
        console.error("Error al cargar datos históricos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadHistoricalData()
  }, [coin.id, timeframe])

  const priceChangeColor = coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={coin.image || "/placeholder.svg"}
              alt={`Logo de ${coin.name}`}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <CardTitle>
                {coin.name} ({coin.symbol.toUpperCase()})
              </CardTitle>
              <CardDescription>
                <span className="flex items-center gap-2">
                  {formatCurrency(coin.current_price)}
                  <span className={priceChangeColor}>{formatPercentage(coin.price_change_percentage_24h)}</span>
                </span>
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Cap. de mercado</div>
              <div className="text-lg font-semibold">{formatCurrency(coin.market_cap, true)}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Volumen 24h</div>
              <div className="text-lg font-semibold">{formatCurrency(coin.total_volume, true)}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Suministro circulante</div>
              <div className="text-lg font-semibold">
                {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Máximo histórico</div>
              <div className="text-lg font-semibold">{formatCurrency(coin.ath)}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Historial de precios</h3>
              <Tabs defaultValue="7" onValueChange={handleTimeframeChange}>
                <TabsList>
                  <TabsTrigger value="1">1D</TabsTrigger>
                  <TabsTrigger value="7">7D</TabsTrigger>
                  <TabsTrigger value="30">30D</TabsTrigger>
                  <TabsTrigger value="90">90D</TabsTrigger>
                  <TabsTrigger value="365">1A</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="h-[300px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => formatDate(date, timeframe)}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${formatCurrency(value, false, true)}`}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${formatCurrency(value, false, true)}`, "Precio"]}
                      labelFormatter={(label) => formatDate(label, timeframe, true)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Estadísticas de precio</h3>
              <div className="space-y-1">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Mínimo 24h / Máximo 24h</span>
                  <span>
                    {formatCurrency(coin.low_24h)} / {formatCurrency(coin.high_24h)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Cambio 7d</span>
                  <span
                    className={coin.price_change_percentage_7d_in_currency >= 0 ? "text-green-500" : "text-red-500"}
                  >
                    {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Volumen de operaciones</span>
                  <span>{formatCurrency(coin.total_volume, true)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Ranking cap. de mercado</span>
                  <span>#{coin.market_cap_rank}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Información de suministro</h3>
              <div className="space-y-1">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Suministro circulante</span>
                  <span>
                    {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
                  </span>
                </div>
                {coin.total_supply && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Suministro total</span>
                    <span>
                      {formatNumber(coin.total_supply)} {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                )}
                {coin.max_supply && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Suministro máximo</span>
                    <span>
                      {formatNumber(coin.max_supply)} {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Valoración totalmente diluida</span>
                  <span>{formatCurrency(coin.fully_diluted_valuation || 0, true)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
