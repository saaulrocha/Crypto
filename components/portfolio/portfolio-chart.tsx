"use client"

import { useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { CoinData, PortfolioHolding } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useTheme } from "next-themes"

interface PortfolioChartProps {
  holdings: PortfolioHolding[]
  coins: CoinData[]
}

export function PortfolioChart({ holdings, coins }: PortfolioChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Generar datos históricos simulados para el portafolio
  // En una app real, obtendrías esto de una API o lo calcularías a partir del historial de transacciones
  const chartData = useMemo(() => {
    // Obtener valor actual del portafolio
    const currentValue = holdings.reduce((total, holding) => {
      const coin = coins.find((c) => c.id === holding.coinId)
      return total + (coin ? holding.amount * coin.current_price : 0)
    }, 0)

    // Crear datos simulados para los últimos 30 días
    const today = new Date()
    const data = []

    // Generar un historial de valor del portafolio aleatorio pero realista
    // Esto es solo para demostración - en una app real usarías datos históricos reales
    let value = currentValue
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Añadir algo de aleatoriedad para crear un gráfico realista
      // Cambios más pequeños para días más recientes
      const volatility = i < 7 ? 0.01 : 0.02
      const change = (Math.random() - 0.5) * volatility

      // Asegurar que tendemos hacia el valor actual
      const trendFactor = i / 30
      value = value * (1 + change * trendFactor)

      if (i === 0) {
        // Asegurar que el último punto es exactamente el valor actual
        value = currentValue
      }

      data.push({
        date: date.toISOString(),
        value,
      })
    }

    return data
  }, [holdings, coins])

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No hay datos de portafolio disponibles</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isDark ? "#4f46e5" : "hsl(var(--primary))"} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isDark ? "#4f46e5" : "hsl(var(--primary))"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(date) => formatDate(date, "30")}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          stroke={isDark ? "#6b7280" : undefined}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${formatCurrency(value, false, true)}`}
          axisLine={false}
          tickLine={false}
          width={80}
          stroke={isDark ? "#6b7280" : undefined}
        />
        <Tooltip
          formatter={(value: number) => [`${formatCurrency(value, false, true)}`, "Valor del Portafolio"]}
          labelFormatter={(label) => formatDate(label, "30", true)}
          contentStyle={{
            backgroundColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
            borderColor: isDark ? "hsl(var(--border))" : "hsl(var(--border))",
            borderRadius: "0.5rem",
            color: isDark ? "hsl(var(--card-foreground))" : "hsl(var(--card-foreground))",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isDark ? "#4f46e5" : "hsl(var(--primary))"}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
