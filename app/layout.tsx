import type React from "react"
import "@/app/globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Panel de Criptomonedas",
  description: "Un panel de criptomonedas moderno construido con Next.js y Tailwind CSS",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="crypto-dashboard-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
