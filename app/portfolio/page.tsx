"use client"

import { Menu } from "lucide-react"
import Link from "next/link"

import { PortfolioView } from "@/components/portfolio/portfolio-view"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Watermark } from "@/components/watermark"

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="hidden sm:flex rounded-full">
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
