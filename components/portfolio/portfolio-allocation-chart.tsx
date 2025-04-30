"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { CoinData, PortfolioHolding } from "@/lib/types"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface PortfolioAllocationChartProps {
  holdings: PortfolioHolding[]
  coins: CoinData[]
}

// Generate a deterministic color based on the coin name
function generateColor(name: string): string {
  // Simple hash function to generate a number from a string
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Convert the hash to a hue value (0-360)
  const hue = hash % 360

  // Use HSL to generate a color with consistent saturation and lightness
  return `hsl(${hue}, 70%, 60%)`
}

export function PortfolioAllocationChart({ holdings, coins }: PortfolioAllocationChartProps) {
  // Calculate the value of each holding and prepare data for the pie chart
  const allocationData = holdings
    .map((holding) => {
      const coin = coins.find((c) => c.id === holding.coinId)
      if (!coin) return null

      const value = holding.amount * coin.current_price
      return {
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        value,
        image: coin.image,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b!.value - a!.value) // Sort by value, largest first

  // Calculate total portfolio value
  const totalValue = allocationData.reduce((sum, item) => sum + item!.value, 0)

  // Custom tooltip component for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            {data.image && (
              <img src={data.image || "/placeholder.svg"} alt={data.name} className="h-5 w-5 rounded-full" />
            )}
            <span className="font-medium">
              {data.name} ({data.symbol})
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{formatCurrency(data.value)}</div>
          <div className="text-sm font-medium">{formatPercentage((data.value / totalValue) * 100)}</div>
        </div>
      )
    }
    return null
  }

  // Custom legend that includes the percentage
  const renderLegend = (props: any) => {
    const { payload } = props

    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}</span>
            <span className="text-muted-foreground">
              ({formatPercentage((entry.payload.value / totalValue) * 100)})
            </span>
          </li>
        ))}
      </ul>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No portfolio data available</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={allocationData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {allocationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={generateColor(entry!.name)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
