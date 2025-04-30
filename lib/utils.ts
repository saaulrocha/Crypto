import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact = false, noSymbol = false): string {
  if (!value && value !== 0) return "N/A"

  if (compact) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Para precios regulares, mostrar más decimales para valores pequeños
  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  })

  const formatted = formatter.format(value)

  // Si noSymbol es true, eliminar el símbolo de euro y devolver solo el número
  return noSymbol ? formatted.replace("€", "") : formatted
}

export function formatPercentage(value: number): string {
  if (!value && value !== 0) return "N/A"

  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  }).format(value / 100)
}

export function formatNumber(value: number): string {
  if (!value && value !== 0) return "N/A"

  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateString: string, timeframe: string, detailed = false): string {
  const date = new Date(dateString)

  if (detailed) {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Diferentes formatos basados en el timeframe
  if (timeframe === "1") {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } else if (timeframe === "7" || timeframe === "30") {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
    }).format(date)
  } else {
    return new Intl.DateTimeFormat("es-ES", {
      month: "short",
      year: "numeric",
    }).format(date)
  }
}
