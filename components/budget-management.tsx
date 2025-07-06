"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CATEGORIES, type Budget } from "@/types/finance"
import { formatCurrency, getMonthKey } from "@/lib/finance-utils"
import { useFinanceContext } from "@/contexts/finance-context"
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CHART_COLORS } from "@/lib/chart-colors"
import { toast } from "sonner"
import { getCategories } from "@/app/actions/transactions"
import { useMutation, useQuery } from "@tanstack/react-query"
import { addBudgetToDB } from "@/app/actions/budgets"

export function BudgetManagement() {
  const { budgets, transactions, currentMonth, addBudget, updateBudget, deleteBudget, error } = useFinanceContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const { isError: categoryError, isSuccess: categorySuccess, isLoading: isCategoryLoading, data: categoryData } = useQuery({
    queryKey: ['getCategories2'],
    queryFn: getCategories,
    staleTime: Infinity
  })
  const mutatetionSucess=(addBudget:(budget:Omit<Budget, 'id'>)=>void, budgetData:Budget|undefined)=>{
    if(budgetData){
      addBudget(budgetData)
    }
    toast.success('Budget created successfully')
  }
  const {isSuccess, isPending ,mutateAsync, data:budgetData }=useMutation({
    mutationKey:['addBudget'],
    mutationFn:addBudgetToDB,
    onSuccess:()=>{mutatetionSucess(addBudget, budgetData?.budgetDetail)},
    onError:()=>{
      toast.error("Error occured while adding the budget")
    }
  })
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: currentMonth,
  })

  const currentBudgets = budgets.filter((b) => b.month === currentMonth)

  const getBudgetProgress = (budget: Budget) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category.name === budget.category.name && getMonthKey(t.date) === budget.month)
      .reduce((sum, t) => sum + t.amount, 0)

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    return { spent, percentage }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.amount || !formData.month) return

    const budgetData = {
      category: categoryData?.categoryData.filter((category)=>category.id==formData.category)[0]!,
      amount: Number.parseFloat(formData.amount),
      month: formData.month,
    }

    try {
      if (editingBudget) {
        updateBudget(editingBudget.id, budgetData)
        toast.success("Budget updated successfully!")
      } else {
        await mutateAsync({budgetData})
        
      }

      setFormData({ category: "", amount: "", month: currentMonth })
      setEditingBudget(null)
      setIsDialogOpen(false)
    } catch (error) {
      toast.error("An error occurred while saving the budget")
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category.id,
      amount: budget.amount.toString(),
      month: budget.month,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteBudget(id)
    toast.success("Budget deleted successfully!")
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return CHART_COLORS.primary.red
    if (percentage > 80) return CHART_COLORS.primary.orange
    return CHART_COLORS.primary.green
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage > 100) return <AlertTriangle className="h-4 w-4" />
    if (percentage > 80) return <TrendingUp className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage > 100) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Over Budget
        </Badge>
      )
    }
    if (percentage > 80) {
      return (
        <Badge className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          Near Limit
        </Badge>
      )
    }
    return (
      <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        On Track
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
              Budget Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingBudget(null)
                  setFormData({ category: "", amount: "", month: currentMonth })
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {!isCategoryLoading && categoryData?.categoryData.filter((cat) => cat.name !== "Income").map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  CHART_COLORS.categories[category.name as keyof typeof CHART_COLORS.categories],
                              }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isPending}>
                    {editingBudget ? "Update Budget" : "Add Budget"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {currentBudgets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-muted-foreground">No budgets set for this month</p>
              <p className="text-sm text-muted-foreground">Add your first budget to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentBudgets.map((budget) => {
                const { spent, percentage } = getBudgetProgress(budget)
                const progressColor = getProgressColor(percentage)

                return (
                  <div key={budget.id} className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS.categories[budget.category.name as keyof typeof CHART_COLORS.categories],
                          }}
                        />
                        <h3 className="font-medium">{budget.category.name}</h3>
                        {getStatusBadge(percentage)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {getStatusIcon(percentage)}
                          Spent:{" "}
                          <span className="font-semibold" style={{ color: progressColor }}>
                            {formatCurrency(spent)}
                          </span>
                        </span>
                        <span>
                          Budget: <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                        </span>
                      </div>

                      <div className="relative">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className="h-3"
                          style={{
                            background: `${progressColor}20`,
                          }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium" style={{ color: progressColor }}>
                          {percentage.toFixed(1)}% used
                        </span>
                        <span>
                          {budget.amount - spent > 0
                            ? `${formatCurrency(budget.amount - spent)} remaining`
                            : `${formatCurrency(spent - budget.amount)} over budget`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
