"use client"

import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from "react"
import type { Transaction, Budget } from "@/types/finance"
import { useQuery } from "@tanstack/react-query"
import { getAllTransactions } from "@/app/actions/transactions"
import { getAllBudgets } from "@/app/actions/budgets"

interface FinanceState {
  transactions: Transaction[]
  budgets: Budget[]
  isLoading: boolean
  error: string | null
}

type FinanceAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: { id: string; transaction: Transaction } }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_BUDGETS"; payload: Budget[] }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: { id: string; budget: Budget } }
  | { type: "DELETE_BUDGET"; payload: string }
  

interface FinanceContextType extends FinanceState {
  // Transaction actions
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void

  // Budget actions
  addBudget: (budget: Omit<Budget, "id">) => void
  updateBudget: (id: string, budget: Omit<Budget, "id">) => void
  deleteBudget: (id: string) => void

  // UI state
  selectedTransaction: Transaction | null
  setSelectedTransaction: (transaction: Transaction | null) => void
  currentMonth: string
  setCurrentMonth: (month: string) => void
}

const STORAGE_KEYS = {
  TRANSACTIONS: "finance-transactions",
  BUDGETS: "finance-budgets",
}

// Sample data



function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload }

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }

    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload.transaction : t)),
      }

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }

    case "SET_BUDGETS":
      return { ...state, budgets: action.payload }

    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
      }

    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((b) => (b.id === action.payload.id ? action.payload.budget : b)),
      }

    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload),
      }

    default:
      return state
  }
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

interface FinanceProviderProps {
  children: ReactNode
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [state, dispatch] = useReducer(financeReducer, {
    transactions: [],
    budgets: [],
    isLoading: true,
    error: null,
  })

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().substring(0, 7))
  const { isSuccess: transactionSuccess, isError: transactionFetchError, isFetching: isTransactionFetching, data: transactionData } = useQuery({ queryKey: ['SET TRANSACTION'], queryFn: getAllTransactions, staleTime: 60 * 1000 });
  const { isSuccess: budgetSuccess, isError: budgetFetchError, isFetching: budgetFetching, data: budgetData } = useQuery({ queryKey: ['SET BUDGET'], queryFn: getAllBudgets, staleTime: 60 * 1000 });
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      if (transactionSuccess && transactionData) {
        dispatch({ type: "SET_TRANSACTIONS", payload: transactionData.transactionData })
      }
      if (transactionFetchError) {
        console.log("error hai error");
      }
      if (budgetSuccess && budgetData) {
        dispatch({ type: "SET_BUDGETS", payload: budgetData.BudgetData })
      }
      if (budgetFetchError) {
        console.log("error hai error");
      }


    }
    // Load sample budgets if no saved data
    catch (error) {
      console.error("Error loading data from localStorage:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load data" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [transactionData, budgetData])

  // Save transactions to localStorage
  // Transaction actions
  const addTransaction = (transactionData: Transaction) => {
    
    const newTransaction: Transaction = {
      ...transactionData
    }
    dispatch({ type: "ADD_TRANSACTION", payload: newTransaction })
  }

  const updateTransaction = (id: string, transactionData: Omit<Transaction, "id">) => {
    const updatedTransaction: Transaction = {
      ...transactionData,
      id,
    }
    dispatch({ type: "UPDATE_TRANSACTION", payload: { id, transaction: updatedTransaction } })
  }

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id })
  }

  // Budget actions
  const addBudget = (budgetData: Omit<Budget, "id">) => {
    // Check for existing budget with same category and month
    const existingBudget = state.budgets.find((b) => b.category === budgetData.category && b.month === budgetData.month)

    if (existingBudget) {
      dispatch({ type: "SET_ERROR", payload: "Budget already exists for this category and month" })
      setTimeout(() => dispatch({ type: "SET_ERROR", payload: null }), 3000)
      return
    }

    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
    }
    dispatch({ type: "ADD_BUDGET", payload: newBudget })
  }

  const updateBudget = (id: string, budgetData: Omit<Budget, "id">) => {
    // Check for conflicts with other budgets
    const conflictingBudget = state.budgets.find(
      (b) => b.id !== id && b.category === budgetData.category && b.month === budgetData.month,
    )

    if (conflictingBudget) {
      dispatch({ type: "SET_ERROR", payload: "Budget already exists for this category and month" })
      setTimeout(() => dispatch({ type: "SET_ERROR", payload: null }), 3000)
      return
    }

    const updatedBudget: Budget = {
      ...budgetData,
      id,
    }
    dispatch({ type: "UPDATE_BUDGET", payload: { id, budget: updatedBudget } })
  }

  const deleteBudget = (id: string) => {
    dispatch({ type: "DELETE_BUDGET", payload: id })
  }

  const value: FinanceContextType = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    selectedTransaction,
    setSelectedTransaction,
    currentMonth,
    setCurrentMonth,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinanceContext() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinanceContext must be used within a FinanceProvider")
  }
  return context
}
