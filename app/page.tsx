"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { SummaryCards } from "@/components/summary-cards"
import { BudgetManagement } from "@/components/budget-management"
import { BudgetComparisonChart } from "@/components/budget-comparison-chart"
import { SpendingInsights } from "@/components/spending-insights"
import { useFinanceContext } from "@/contexts/finance-context"
import { Loader2 } from "lucide-react"

export default function PersonalFinanceApp() {
  const { transactions, budgets, isLoading } = useFinanceContext()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your financial data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Personal Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Track your expenses, manage budgets, and gain insights into your spending habits
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <SummaryCards transactions={transactions} />

            <div className="grid gap-6 md:grid-cols-2">
              <MonthlyExpensesChart transactions={transactions} />
              <CategoryPieChart transactions={transactions} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <BudgetComparisonChart budgets={budgets} transactions={transactions} />
              <SpendingInsights transactions={transactions} budgets={budgets} />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 max-h-md overflow-auto">
              <TransactionForm />
              <TransactionList />
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <BudgetManagement />

            <BudgetComparisonChart budgets={budgets} transactions={transactions} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <SpendingInsights transactions={transactions} budgets={budgets} />

              <div className="grid gap-6 md:grid-cols-2">
                <MonthlyExpensesChart transactions={transactions} />
                <CategoryPieChart transactions={transactions} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
