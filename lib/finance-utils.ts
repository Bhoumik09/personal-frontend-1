import type { Transaction, CategorySummary } from "@/types/finance"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getMonthKey(date: string): string {
  return date.substring(0, 7) // YYYY-MM
}

export function getCategorySummary(transactions: Transaction[]): CategorySummary[] {
  const categoryTotals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "expense") {
        acc[transaction.category.name] = (acc[transaction.category.name] || 0) + transaction.amount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const totalExpenses:number = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
    count: transactions.filter((t) => t.category.name === category && t.type === "expense").length,
    percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
  }))
}

export function getMonthlyExpenses(transactions: Transaction[]): Array<{ month: string; amount: number }> {
  const monthlyTotals = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        const month = getMonthKey(transaction.date)
        acc[month] = (acc[month] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  return Object.entries(monthlyTotals)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
}
