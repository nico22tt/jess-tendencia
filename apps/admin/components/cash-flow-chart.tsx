"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2, TrendingUp } from "lucide-react"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

interface MonthData {
  month: string
  income: number
  expense: number
  balance: number
}

export function CashFlowChart() {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/cash-flow-monthly")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        if (json.success) {
          setData(json.data)
        }
      })
      .catch((error) => {
        console.error("Error fetching monthly cash flow:", error)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-foreground">
          Ingresos vs Gastos Mensuales
        </h3>
      </div>

      <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                width={90}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={formatCurrency}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 13,
                  padding: "12px",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "13px",
                  paddingTop: "10px",
                }}
                iconType="circle"
              />
              <Bar
                dataKey="income"
                name="Ingresos"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Gastos"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
