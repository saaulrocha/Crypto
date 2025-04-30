"use client"

import Link from "next/link"

import { PortfolioView } from "@/components/portfolio/portfolio-view"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Watermark } from "@/components/watermark"

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold tracking-tight">Panel de Criptomonedas</h1>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/">Inicio</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6">
        <PortfolioView />
      </main>

      <Watermark />
    </div>
  )
}
