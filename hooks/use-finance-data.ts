"use client"

import { useState, useEffect } from "react"
import type { Transaction, Budget } from "@/types/finance"

const STORAGE_KEYS = {
  TRANSACTIONS: "finance-transactions",
  BUDGETS: "finance-budgets",
}

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS)

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save transactions to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
    }
  }, [transactions, isLoading])

  // Save budgets to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
    }
  }, [budgets, isLoading])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === id ? { ...transaction, ...updates } : transaction)),
    )
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    }
    setBudgets((prev) => [newBudget, ...prev])
  }

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((budget) => (budget.id === id ? { ...budget, ...updates } : budget)))
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id))
  }

  return {
    transactions,
    budgets,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
  }
}
