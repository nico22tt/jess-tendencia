"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

interface CashFlowSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  thisMonth: {
    income: number
    expense: number
  }
}

export function CashFlowSummary() {
  const [data, setData] = useState<CashFlowSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/cash-flow-summary")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 bg-card border border-border">
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Ingresos */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Ingresos del mes
          </span>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
          {formatCurrency(data.thisMonth.income)}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          Total histórico: {formatCurrency(data.totalIncome)}
        </p>
      </Card>

      {/* Gastos */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            Gastos del mes
          </span>
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
          {formatCurrency(data.thisMonth.expense)}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Total histórico: {formatCurrency(data.totalExpense)}
        </p>
      </Card>

      {/* Balance */}
      <Card
        className={`p-6 bg-gradient-to-br ${
          data.balance >= 0
            ? "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
            : "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              data.balance >= 0
                ? "text-blue-700 dark:text-blue-300"
                : "text-orange-700 dark:text-orange-300"
            }`}
          >
            Balance Total
          </span>
          <DollarSign
            className={`h-5 w-5 ${
              data.balance >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          />
        </div>
        <p
          className={`text-2xl font-bold ${
            data.balance >= 0
              ? "text-blue-900 dark:text-blue-100"
              : "text-orange-900 dark:text-orange-100"
          }`}
        >
          {formatCurrency(data.balance)}
        </p>
        <p
          className={`text-xs mt-1 ${
            data.balance >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {data.balance >= 0 ? "Positivo ✓" : "Negativo ⚠"}
        </p>
      </Card>
    </div>
  )
}
