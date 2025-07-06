"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import type { Transaction } from "@/types/finance"
import { getMonthlyExpenses, formatCurrency } from "@/lib/finance-utils"
import { CHART_COLORS, generateColorPalette } from "@/lib/chart-colors"

interface MonthlyExpensesChartProps {
  transactions: Transaction[]
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const monthlyData = getMonthlyExpenses(transactions)

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    )
  }

  // Generate colors for each month
  const colors = generateColorPalette(monthlyData.length)

  const chartConfig = {
    amount: {
      label: "Amount",
      color: CHART_COLORS.primary.red,
    },
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const [year, month] = label.split("-")
      const monthName = new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 border-border">
          <p className="font-medium text-foreground">{monthName}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].color }} />
            <span className="text-sm text-muted-foreground">Expenses:</span>
            <span className="font-semibold text-red-600">{formatCurrency(payload[0].value)}</span>
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
          <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600" />
          Monthly Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary.red} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary.red} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => {
                  const [year, month] = value.split("-")
                  return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  })
                }}
                tick={{ fontSize: 12, fill: "#64748b" }}
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
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="url(#expenseGradient)">
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
