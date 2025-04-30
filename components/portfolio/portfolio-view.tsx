"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, DollarSign, LineChart, Plus, Trash2 } from "lucide-react"

import { AddTransactionModal } from "@/components/portfolio/add-transaction-modal"
import { PortfolioAllocationChart } from "@/components/portfolio/portfolio-allocation-chart"
import { PortfolioChart } from "@/components/portfolio/portfolio-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCoins } from "@/lib/api"
import type { CoinData, PortfolioHolding, Transaction } from "@/lib/types"
import { formatCurrency, formatPercentage } from "@/lib/utils"

export function PortfolioView() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [portfolioProfitLoss, setPortfolioProfitLoss] = useState(0)
  const [portfolioProfitLossPercentage, setPortfolioProfitLossPercentage] = useState(0)
  const [portfolioChange24h, setPortfolioChange24h] = useState(0)
  const [portfolioChange24hPercentage, setPortfolioChange24hPercentage] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Cargar datos de monedas
        const coinsData = await fetchCoins()
        setCoins(coinsData)

        // Cargar portafolio desde localStorage
        const savedPortfolio = localStorage.getItem("cryptoPortfolio")
        if (savedPortfolio) {
          setHoldings(JSON.parse(savedPortfolio))
        }
      } catch (error) {
        console.error("Error al cargar datos del portafolio:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // Configurar intervalo para actualizar datos
    const interval = setInterval(loadData, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (coins.length > 0 && holdings.length > 0) {
      calculatePortfolioMetrics()
    } else {
      // Reiniciar métricas si no hay tenencias
      setPortfolioValue(0)
      setPortfolioProfitLoss(0)
      setPortfolioProfitLossPercentage(0)
      setPortfolioChange24h(0)
      setPortfolioChange24hPercentage(0)
      setTotalInvested(0)
    }
  }, [coins, holdings])

  const calculatePortfolioMetrics = () => {
    let currentValue = 0
    let investedValue = 0
    let previousDayValue = 0

    holdings.forEach((holding) => {
      const coin = coins.find((c) => c.id === holding.coinId)
      if (coin) {
        // Valor actual
        const holdingValue = holding.amount * coin.current_price
        currentValue += holdingValue

        // Valor invertido
        investedValue += holding.totalCost

        // Valor del día anterior (para cambio 24h)
        const previousPrice = coin.current_price / (1 + coin.price_change_percentage_24h / 100)
        previousDayValue += holding.amount * previousPrice
      }
    })

    // Calcular métricas
    const profitLoss = currentValue - investedValue
    const profitLossPercentage = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0
    const change24h = currentValue - previousDayValue
    const change24hPercentage = previousDayValue > 0 ? (change24h / previousDayValue) * 100 : 0

    // Actualizar estado
    setPortfolioValue(currentValue)
    setPortfolioProfitLoss(profitLoss)
    setPortfolioProfitLossPercentage(profitLossPercentage)
    setPortfolioChange24h(change24h)
    setPortfolioChange24hPercentage(change24hPercentage)
    setTotalInvested(investedValue)
  }

  const addTransaction = (transaction: Transaction) => {
    const { coinId, type, amount, price, date } = transaction
    const cost = amount * price

    // Buscar si ya tenemos esta moneda en nuestras tenencias
    const existingHoldingIndex = holdings.findIndex((h) => h.coinId === coinId)

    let updatedHoldings: PortfolioHolding[]

    if (type === "buy") {
      if (existingHoldingIndex >= 0) {
        // Actualizar tenencia existente
        updatedHoldings = [...holdings]
        const existingHolding = updatedHoldings[existingHoldingIndex]

        // Calcular nuevo costo promedio
        const totalAmount = existingHolding.amount + amount
        const totalCost = existingHolding.totalCost + cost
        const averageCost = totalCost / totalAmount

        updatedHoldings[existingHoldingIndex] = {
          ...existingHolding,
          amount: totalAmount,
          totalCost: totalCost,
          averageCost: averageCost,
          transactions: [...existingHolding.transactions, transaction],
        }
      } else {
        // Añadir nueva tenencia
        const newHolding: PortfolioHolding = {
          coinId,
          amount,
          totalCost: cost,
          averageCost: price,
          transactions: [transaction],
        }
        updatedHoldings = [...holdings, newHolding]
      }
    } else {
      // Transacción de venta
      if (existingHoldingIndex >= 0) {
        updatedHoldings = [...holdings]
        const existingHolding = updatedHoldings[existingHoldingIndex]

        // Comprobar si se vende más de lo que tenemos
        if (amount > existingHolding.amount) {
          alert("No puedes vender más de lo que posees")
          return
        }

        // Calcular cantidad restante
        const remainingAmount = existingHolding.amount - amount

        if (remainingAmount > 0) {
          // Actualizar tenencia con cantidad reducida (mantener costo promedio igual)
          updatedHoldings[existingHoldingIndex] = {
            ...existingHolding,
            amount: remainingAmount,
            totalCost: existingHolding.averageCost * remainingAmount,
            transactions: [...existingHolding.transactions, transaction],
          }
        } else {
          // Eliminar tenencia completamente si la cantidad es 0
          updatedHoldings = holdings.filter((_, index) => index !== existingHoldingIndex)
        }
      } else {
        alert("No puedes vender una moneda que no posees")
        return
      }
    }

    // Actualizar estado y localStorage
    setHoldings(updatedHoldings)
    localStorage.setItem("cryptoPortfolio", JSON.stringify(updatedHoldings))
  }

  const removeHolding = (coinId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tenencia?")) {
      const updatedHoldings = holdings.filter((holding) => holding.coinId !== coinId)
      setHoldings(updatedHoldings)
      localStorage.setItem("cryptoPortfolio", JSON.stringify(updatedHoldings))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Portafolio</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Añadir Transacción
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[100px] rounded-lg bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Valor Total</CardDescription>
                <CardTitle className="text-xl sm:text-2xl">{formatCurrency(portfolioValue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {formatCurrency(totalInvested)} invertido
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cambio 24h</CardDescription>
                <CardTitle
                  className={`text-xl sm:text-2xl ${portfolioChange24h >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {formatCurrency(portfolioChange24h)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {portfolioChange24hPercentage >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs sm:text-sm ${
                      portfolioChange24hPercentage >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {formatPercentage(portfolioChange24hPercentage)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Beneficio/Pérdida Total</CardDescription>
                <CardTitle
                  className={`text-xl sm:text-2xl ${portfolioProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {formatCurrency(portfolioProfitLoss)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {portfolioProfitLossPercentage >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs sm:text-sm ${
                      portfolioProfitLossPercentage >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {formatPercentage(portfolioProfitLossPercentage)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Número de Activos</CardDescription>
                <CardTitle className="text-xl sm:text-2xl">{holdings.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <LineChart className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {holdings.length > 0 ? "Siguiendo rendimiento" : "Añade activos para empezar a seguir"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {holdings.length > 0 ? (
            <Tabs defaultValue="holdings">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="holdings" className="flex-1 sm:flex-none">
                  Tenencias
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex-1 sm:flex-none">
                  Rendimiento
                </TabsTrigger>
                <TabsTrigger value="allocation" className="flex-1 sm:flex-none">
                  Distribución
                </TabsTrigger>
              </TabsList>
              <TabsContent value="holdings" className="mt-4">
                <Card>
                  <CardContent className="p-0 overflow-auto">
                    <div className="w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activo</TableHead>
                            <TableHead className="hidden sm:table-cell">Cantidad</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Promedio</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Actual</TableHead>
                            <TableHead>Valor Actual</TableHead>
                            <TableHead>Beneficio/Pérdida</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {holdings.map((holding) => {
                            const coin = coins.find((c) => c.id === holding.coinId)
                            if (!coin) return null

                            const currentValue = holding.amount * coin.current_price
                            const profitLoss = currentValue - holding.totalCost
                            const profitLossPercentage = (profitLoss / holding.totalCost) * 100

                            return (
                              <TableRow key={holding.coinId}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    <div className="relative w-6 h-6 flex-shrink-0 mr-2 overflow-hidden rounded-full">
                                      <img
                                        src={coin.image || "/placeholder.svg"}
                                        alt={coin.name}
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                        style={{ position: "relative", zIndex: 1 }}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs sm:text-sm">{coin.name}</div>
                                      <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                                  {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                  {formatCurrency(holding.averageCost)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                  {formatCurrency(coin.current_price)}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">{formatCurrency(currentValue)}</TableCell>
                                <TableCell>
                                  <div
                                    className={`text-xs sm:text-sm ${
                                      profitLoss >= 0 ? "text-green-500" : "text-red-500"
                                    }`}
                                  >
                                    {formatCurrency(profitLoss)}
                                    <div className="text-xs">{formatPercentage(profitLossPercentage)}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeHolding(holding.coinId)}
                                    title="Eliminar tenencia"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="performance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento del Portafolio</CardTitle>
                    <CardDescription>Sigue el valor de tu portafolio a lo largo del tiempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] sm:h-[400px]">
                      <PortfolioChart holdings={holdings} coins={coins} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="allocation" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución del Portafolio</CardTitle>
                    <CardDescription>Distribución de activos en tu portafolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PortfolioAllocationChart holdings={holdings} coins={coins} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>Aún no hay activos</CardTitle>
                <CardDescription>Añade tu primera transacción para empezar a seguir tu portafolio</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Añadir Transacción
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={addTransaction}
        coins={coins}
        holdings={holdings}
      />
    </div>
  )
}
