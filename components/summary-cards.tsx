"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/types/finance"
import { formatCurrency, getCategorySummary } from "@/lib/finance-utils"
import { TrendingUp, TrendingDown, PieChart, Wallet } from "lucide-react"
import { CHART_COLORS } from "@/lib/chart-colors"

interface SummaryCardsProps {
  transactions: Transaction[]
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  const categorySummary:ReturnType<typeof getCategorySummary> = getCategorySummary(transactions)
  const topCategory =
    categorySummary.length > 0
      ? categorySummary.reduce((max, current) => (current.total > max.total ? current : max))
      : null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "income").length} transactions
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="p-2 bg-red-100 rounded-full">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "expense").length} transactions
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
            netIncome >= 0 ? "from-blue-500 to-cyan-500" : "from-orange-500 to-red-500"
          }`}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <div className={`p-2 rounded-full ${netIncome >= 0 ? "bg-blue-100" : "bg-orange-100"}`}>
            <Wallet className={`h-4 w-4 ${netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`}>
            {formatCurrency(netIncome)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${netIncome >= 0 ? "bg-blue-500" : "bg-orange-500"}`} />
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <PieChart className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {topCategory ? formatCurrency(topCategory.total) : "$0.00"}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: topCategory
                  ? CHART_COLORS.categories[topCategory.category as keyof typeof CHART_COLORS.categories] ||
                    CHART_COLORS.primary.purple
                  : CHART_COLORS.primary.purple,
              }}
            />
            <p className="text-xs text-muted-foreground truncate">
              {topCategory ? topCategory.category : "No expenses yet"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
