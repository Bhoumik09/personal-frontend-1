export const CHART_COLORS = {
  // Primary colors for main data
  primary: {
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    purple: "#8b5cf6",
    orange: "#f59e0b",
    teal: "#14b8a6",
    pink: "#ec4899",
    indigo: "#6366f1",
  },

  // Category-specific colors
  categories: {
    "Food & Dining": "#ef4444", // Red
    Transportation: "#3b82f6", // Blue
    Shopping: "#ec4899", // Pink
    Entertainment: "#8b5cf6", // Purple
    "Bills & Utilities": "#f59e0b", // Orange
    Healthcare: "#10b981", // Green
    Education: "#6366f1", // Indigo
    Travel: "#14b8a6", // Teal
    Income: "#10b981", // Green
    Other: "#6b7280", // Gray
  },

  // Gradient colors
  gradients: {
    income: ["#10b981", "#34d399"],
    expense: ["#ef4444", "#f87171"],
    budget: ["#3b82f6", "#60a5fa"],
    spending: ["#f59e0b", "#fbbf24"],
  },

  // Status colors
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
  },

  // Background colors with opacity
  backgrounds: {
    income: "rgba(16, 185, 129, 0.1)",
    expense: "rgba(239, 68, 68, 0.1)",
    budget: "rgba(59, 130, 246, 0.1)",
    warning: "rgba(245, 158, 11, 0.1)",
  },
} as const

// Get color for category
export function getCategoryColor(category: string): string {
  return CHART_COLORS.categories[category as keyof typeof CHART_COLORS.categories] || CHART_COLORS.primary.blue
}

// Get gradient colors
export function getGradientColors(type: keyof typeof CHART_COLORS.gradients): string[] {
  return CHART_COLORS.gradients[type]
}

// Generate color palette for multiple items
export function generateColorPalette(count: number): string[] {
  const baseColors = Object.values(CHART_COLORS.primary)
  const colors: string[] = []

  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }

  return colors
}

// Color utilities for different chart types
export const CHART_THEMES = {
  bar: {
    income: {
      fill: CHART_COLORS.primary.green,
      stroke: CHART_COLORS.primary.green,
      fillOpacity: 0.8,
    },
    expense: {
      fill: CHART_COLORS.primary.red,
      stroke: CHART_COLORS.primary.red,
      fillOpacity: 0.8,
    },
  },
  pie: {
    colors: Object.values(CHART_COLORS.categories),
  },
  line: {
    income: CHART_COLORS.primary.green,
    expense: CHART_COLORS.primary.red,
    budget: CHART_COLORS.primary.blue,
  },
} as const
