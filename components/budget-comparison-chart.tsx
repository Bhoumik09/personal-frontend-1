"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { Budget, Transaction } from "@/types/finance"
import { formatCurrency, getMonthKey } from "@/lib/finance-utils"
import { CHART_COLORS } from "@/lib/chart-colors"

interface BudgetComparisonChartProps {
  budgets: Budget[]
  transactions: Transaction[]
}

export function BudgetComparisonChart({ budgets, transactions }: BudgetComparisonChartProps) {
  const currentMonth = new Date().toISOString().substring(0, 7)
  const currentBudgets = budgets.filter((b) => b.month === currentMonth)

  const chartData = currentBudgets.map((budget) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category.name === budget.category.name && getMonthKey(t.date) === budget.month)
      .reduce((sum, t) => sum + t.amount, 0)

    const remaining = Math.max(0, budget.amount - spent)
    const overBudget = Math.max(0, spent - budget.amount)

    return {
      category: budget.category.name,
      budget: budget.amount,
      spent: Math.min(spent, budget.amount), // Cap spent at budget for visual clarity
      overBudget: overBudget,
      remaining: remaining,
      totalSpent: spent,
      percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
    }
  })

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No budget data available for this month</p>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = {
    budget: {
      label: "Budget",
      color: CHART_COLORS.primary.blue,
    },
    spent: {
      label: "Spent",
      color: CHART_COLORS.primary.orange,
    },
    overBudget: {
      label: "Over Budget",
      color: CHART_COLORS.primary.red,
    },
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = chartData.find((d) => d.category === label)
      if (!data) return null

      return (
        <div className="bg-background border rounded-lg shadow-lg p-4 border-border min-w-[200px]">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Budget:</span>
              </div>
              <span className="font-semibold">{formatCurrency(data.budget)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Spent:</span>
              </div>
              <span className="font-semibold text-orange-600">{formatCurrency(data.totalSpent)}</span>
            </div>
            {data.overBudget > 0 && (
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Over Budget:</span>
                </div>
                <span className="font-semibold text-red-600">{formatCurrency(data.overBudget)}</span>
              </div>
            )}
            <div className="flex justify-between items-center gap-4 pt-1 border-t">
              <span className="text-muted-foreground">Usage:</span>
              <span
                className={`font-semibold ${data.percentage > 100 ? "text-red-600" : data.percentage > 80 ? "text-orange-600" : "text-green-600"}`}
              >
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-orange-500" />
          Budget vs Actual - {new Date(currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary.blue} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary.blue} stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary.orange} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary.orange} stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="overBudgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary.red} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary.red} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={{ stroke: "#cbd5e1" }}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={{ stroke: "#cbd5e1" }}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar
                dataKey="budget"
                fill="url(#budgetGradient)"
                name="Budget"
                radius={[4, 4, 0, 0]}
                stroke={CHART_COLORS.primary.blue}
                strokeWidth={1}
              />
              <Bar
                dataKey="spent"
                fill="url(#spentGradient)"
                name="Spent"
                radius={[4, 4, 0, 0]}
                stroke={CHART_COLORS.primary.orange}
                strokeWidth={1}
              />
              <Bar
                dataKey="overBudget"
                fill="url(#overBudgetGradient)"
                name="Over Budget"
                radius={[4, 4, 0, 0]}
                stroke={CHART_COLORS.primary.red}
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
