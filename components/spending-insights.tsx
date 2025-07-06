"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction, Budget } from "@/types/finance"
import { formatCurrency, getCategorySummary, getMonthKey } from "@/lib/finance-utils"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface SpendingInsightsProps {
  transactions: Transaction[]
  budgets: Budget[]
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const currentMonth = new Date().toISOString().substring(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 7)

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "expense" && getMonthKey(t.date) === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthExpenses = transactions
    .filter((t) => t.type === "expense" && getMonthKey(t.date) === lastMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseChange =
    lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  const categorySummary = getCategorySummary(transactions.filter((t) => getMonthKey(t.date) === currentMonth))

  const topSpendingCategory =
    categorySummary.length > 0
      ? categorySummary.reduce((max, current) => (current.total > max.total ? current : max))
      : null

  const currentBudgets = budgets.filter((b) => b.month === currentMonth)
  const budgetInsights = currentBudgets.map((budget) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category === budget.category && getMonthKey(t.date) === budget.month)
      .reduce((sum, t) => sum + t.amount, 0)

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    return { ...budget, spent, percentage }
  })

  const overBudgetCategories = budgetInsights.filter((b) => b.percentage > 100)
  const nearLimitCategories = budgetInsights.filter((b) => b.percentage > 80 && b.percentage <= 100)
  const onTrackCategories = budgetInsights.filter((b) => b.percentage <= 80)

  const insights = []

  // Monthly comparison insight
  if (lastMonthExpenses > 0) {
    insights.push({
      type: expenseChange > 0 ? "warning" : "positive",
      icon: expenseChange > 0 ? TrendingUp : TrendingDown,
      title: "Monthly Spending Trend",
      description: `Your expenses ${expenseChange > 0 ? "increased" : "decreased"} by ${Math.abs(expenseChange).toFixed(1)}% compared to last month`,
      value: `${expenseChange > 0 ? "+" : ""}${expenseChange.toFixed(1)}%`,
    })
  }

  // Top spending category
  if (topSpendingCategory) {
    insights.push({
      type: "info",
      icon: TrendingUp,
      title: "Top Spending Category",
      description: `${topSpendingCategory.category} accounts for ${topSpendingCategory.percentage.toFixed(1)}% of your expenses`,
      value: formatCurrency(topSpendingCategory.total),
    })
  }

  // Budget insights
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Over Budget",
      description: `You're over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? "category" : "categories"}`,
      value: `${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? "category" : "categories"}`,
    })
  }

  if (nearLimitCategories.length > 0) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Near Budget Limit",
      description: `You're close to your budget limit in ${nearLimitCategories.length} ${nearLimitCategories.length === 1 ? "category" : "categories"}`,
      value: `${nearLimitCategories.length} ${nearLimitCategories.length === 1 ? "category" : "categories"}`,
    })
  }

  if (onTrackCategories.length > 0) {
    insights.push({
      type: "positive",
      icon: CheckCircle,
      title: "On Track",
      description: `You're on track with your budget in ${onTrackCategories.length} ${onTrackCategories.length === 1 ? "category" : "categories"}`,
      value: `${onTrackCategories.length} ${onTrackCategories.length === 1 ? "category" : "categories"}`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Not enough data for insights</p>
            <p className="text-sm text-muted-foreground">Add more transactions and budgets to see insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div
                    className={`p-2 rounded-full ${
                      insight.type === "positive"
                        ? "bg-green-100 text-green-600"
                        : insight.type === "warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{insight.title}</h3>
                      <Badge
                        variant={
                          insight.type === "positive"
                            ? "default"
                            : insight.type === "warning"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {insight.value}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
