export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: {
    name: string;
    id: string;
  };
  type: "income" | "expense";
}

export interface Budget {
  id: string;
  category: {
    name: string;
    id: string;
  };
  amount: number;
  month: string; // YYYY-MM format
}

export interface CategorySummary {
  category: string
  total: number;
  count: number;
  percentage: number;
}

export const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Income",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
