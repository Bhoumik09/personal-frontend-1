import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FinanceProvider } from "@/contexts/finance-context"
import { Toaster } from "sonner"
import TanstackQueryProvider from "@/components/query-porvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Personal Finance Visualizer",
  description: "Track your expenses, manage budgets, and gain insights into your spending habits",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TanstackQueryProvider>
          <FinanceProvider>
            {children}
            <Toaster position="top-right" />
          </FinanceProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
