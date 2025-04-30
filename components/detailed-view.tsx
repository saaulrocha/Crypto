"use client"

import { useEffect, useState } from "react"
import { X, ZoomIn, ZoomOut } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCoinHistory } from "@/lib/api"
import type { CoinData, HistoricalData } from "@/lib/types"
import { formatCurrency, formatDate, formatNumber, formatPercentage } from "@/lib/utils"
import { useTheme } from "next-themes"

interface DetailedViewProps {
  coin: CoinData
  onClose: () => void
}

export function DetailedView({ coin, onClose }: DetailedViewProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<string>("7")
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

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

  const priceChangeColor =
    coin.price_change_percentage_24h >= 0 ? "text-[hsl(var(--crypto-green))]" : "text-[hsl(var(--crypto-red))]"

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
  }

  const handleZoomIn = () => {
    if (zoomLevel < 2) setZoomLevel(zoomLevel + 0.25)
  }

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(zoomLevel - 0.25)
  }

  // Ajustar datos para el zoom
  const zoomedData =
    historicalData.length > 0
      ? historicalData.filter((_, index) => {
          const totalPoints = historicalData.length
          const visiblePoints = Math.floor(totalPoints / zoomLevel)
          const startPoint = Math.floor((totalPoints - visiblePoints) / 2)
          return index >= startPoint && index < startPoint + visiblePoints
        })
      : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto border border-border/50 shadow-lg m-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-sm"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                <img
                  src={coin.image || "/placeholder.svg"}
                  alt={`Logo de ${coin.name}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  style={{ position: "relative", zIndex: 1 }}
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl">
                {coin.name} <span className="text-muted-foreground">({coin.symbol.toUpperCase()})</span>
              </CardTitle>
              <CardDescription>
                <span className="flex items-center gap-2 text-base sm:text-lg">
                  {formatCurrency(coin.current_price)}
                  <span className={priceChangeColor}>{formatPercentage(coin.price_change_percentage_24h)}</span>
                </span>
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
            <div className="stat-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Cap. de mercado</div>
              <div className="text-sm sm:text-lg font-semibold">{formatCurrency(coin.market_cap, true)}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Volumen 24h</div>
              <div className="text-sm sm:text-lg font-semibold">{formatCurrency(coin.total_volume, true)}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Suministro circulante</div>
              <div className="text-sm sm:text-lg font-semibold">
                {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
              </div>
            </div>
            <div className="stat-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Máximo histórico</div>
              <div className="text-sm sm:text-lg font-semibold">{formatCurrency(coin.ath)}</div>
            </div>
          </div>

          <div className="space-y-3 chart-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-lg font-semibold">Historial de precios</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Tabs defaultValue="7" onValueChange={handleTimeframeChange} className="mr-0 sm:mr-2">
                  <TabsList className="bg-muted/50 h-8 w-full">
                    <TabsTrigger value="1" className="text-xs sm:text-sm">
                      1D
                    </TabsTrigger>
                    <TabsTrigger value="7" className="text-xs sm:text-sm">
                      7D
                    </TabsTrigger>
                    <TabsTrigger value="30" className="text-xs sm:text-sm">
                      30D
                    </TabsTrigger>
                    <TabsTrigger value="90" className="text-xs sm:text-sm">
                      90D
                    </TabsTrigger>
                    <TabsTrigger value="365" className="text-xs sm:text-sm">
                      1A
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="h-8 w-8 rounded-full"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 2}
                    className="h-8 w-8 rounded-full"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-[250px] sm:h-[300px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={zoomedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isDark ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={isDark ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => formatDate(date, timeframe)}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      stroke={isDark ? "hsl(var(--muted-foreground))" : undefined}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${formatCurrency(value, false, true)}`}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                      stroke={isDark ? "hsl(var(--muted-foreground))" : undefined}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${formatCurrency(value, false, true)}`, "Precio"]}
                      labelFormatter={(label) => formatDate(label, timeframe, true)}
                      contentStyle={{
                        backgroundColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
                        borderColor: isDark ? "hsl(var(--border))" : "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
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
              <div className="space-y-1 rounded-xl border p-4">
                <div className="flex justify-between py-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Mínimo 24h / Máximo 24h</span>
                  <span className="text-xs sm:text-sm">
                    {formatCurrency(coin.low_24h)} / {formatCurrency(coin.high_24h)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Cambio 7d</span>
                  <span
                    className={`text-xs sm:text-sm ${
                      coin.price_change_percentage_7d_in_currency >= 0
                        ? "text-[hsl(var(--crypto-green))]"
                        : "text-[hsl(var(--crypto-red))]"
                    }`}
                  >
                    {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Volumen de operaciones</span>
                  <span className="text-xs sm:text-sm">{formatCurrency(coin.total_volume, true)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Ranking cap. de mercado</span>
                  <span className="text-xs sm:text-sm font-medium">#{coin.market_cap_rank}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Información de suministro</h3>
              <div className="space-y-1 rounded-xl border p-4">
                <div className="flex justify-between py-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Suministro circulante</span>
                  <span className="text-xs sm:text-sm">
                    {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
                  </span>
                </div>
                {coin.total_supply && (
                  <div className="flex justify-between py-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">Suministro total</span>
                    <span className="text-xs sm:text-sm">
                      {formatNumber(coin.total_supply)} {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                )}
                {coin.max_supply && (
                  <div className="flex justify-between py-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">Suministro máximo</span>
                    <span className="text-xs sm:text-sm">
                      {formatNumber(coin.max_supply)} {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Valoración totalmente diluida</span>
                  <span className="text-xs sm:text-sm">{formatCurrency(coin.fully_diluted_valuation || 0, true)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
