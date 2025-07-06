"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CATEGORIES } from "@/types/finance"
import { useFinanceContext } from "@/contexts/finance-context"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"
import { addTransactionToDB, getCategories } from "@/app/actions/transactions"

interface TransactionFormProps {
  onSuccess?: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { selectedTransaction, setSelectedTransaction, addTransaction, updateTransaction, error } = useFinanceContext()
  const { isError: categoryError, isSuccess: categorySuccess, isLoading: isCategoryLoading, data: categoryData } = useQuery({
    queryKey: ['getCategories'],
    queryFn: getCategories,
    staleTime: Infinity
  })
  const { isSuccess, isError, isPending, mutateAsync, data } = useMutation({ mutationFn: addTransactionToDB, mutationKey: ['addTransaction'] , onSuccess:()=>{
        toast.success("Transaction created successfully!")
        // Reset form for new transactions
        setFormData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          category: "",
          type: "expense",
        })
  }})
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    type: "expense" as "income" | "expense",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when selectedTransaction changes
  useEffect(() => {
    if (selectedTransaction) {
      setFormData({
        amount: selectedTransaction.amount.toString(),
        date: selectedTransaction.date,
        description: selectedTransaction.description,
        category: selectedTransaction.category.id,
        type: selectedTransaction.type,
      })
    } else {
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "",
        type: "expense",
      })
    }
    setErrors({})
  }, [selectedTransaction])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    if (!formData.date) {
      newErrors.date = "Date is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryData?.categoryData) return;
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500))

      const transactionData = {
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        description: formData.description.trim(),
        category: categoryData?.categoryData.filter(category => formData.category == category.id)[0],
        type: formData.type,
      }
      if (selectedTransaction) {
        updateTransaction(selectedTransaction.id, transactionData)
        toast.success("Transaction updated successfully!")
        setSelectedTransaction(null)
      } else {
        await mutateAsync({ transactionData });
        if(isSuccess){
          console.log(data.transactionDetail)
          addTransaction(data.transactionDetail);
        }

      }

      onSuccess?.()
    } catch (error) {
      toast.error("An error occurred while saving the transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setSelectedTransaction(null)
    setFormData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      type: "expense",
    })
    setErrors({})
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{selectedTransaction ? "Edit Transaction" : "Add New Transaction"}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") => setFormData((prev) => ({ ...prev, type: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className={errors.amount ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.amount && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.amount}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className={errors.date ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.date && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.date}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {isCategoryLoading ? 
                  <div>
                    <Loader2 size={10} className="animate-spin"/>
                  </div>
                  :categoryData?.categoryData?.map((category) => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className={errors.description ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {selectedTransaction ? "Updating..." : "Creating..."}
                </>
              ) : selectedTransaction ? (
                "Update Transaction"
              ) : (
                "Add Transaction"
              )}
            </Button>
            {selectedTransaction && (
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
