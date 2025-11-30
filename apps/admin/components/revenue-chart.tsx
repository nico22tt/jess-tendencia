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

const formatNumber = (value: number | string) =>
  Number(value).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  })

export function RevenueChart() {
  const [data, setData] = useState<{ month: string; total: number; successful: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/revenue")
        const json = await res.json()
        setData(Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [])
      } catch {
        setData([])
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalSum = data.reduce((a, b) => a + (b.total ?? 0), 0)

  return (
    <Card className="bg-card border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Ingresos mensuales</h3>
        <span className="text-base font-bold text-primary px-3 py-1 rounded bg-primary/10">
          Total año: {formatNumber(totalSum)}
        </span>
      </div>

      {/* Contenedor con altura fija para evitar contracción */}
      <div className="relative flex-1 min-h-[240px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-muted-foreground bg-background/40">
            Cargando datos...
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              width={80}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={formatNumber}
            />
            <Tooltip
              formatter={formatNumber}
              labelStyle={{ color: "hsl(var(--primary))", fontWeight: 700 }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
                fontSize: 15,
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              formatter={(value) =>
                value === "total"
                  ? "Total de ventas"
                  : value === "successful"
                  ? "Transacciones exitosas"
                  : value
              }
              wrapperStyle={{
                color: "hsl(var(--muted-foreground))",
                fontSize: "15px",
              }}
            />
            <Bar
              dataKey="total"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
              minPointSize={4}
              isAnimationActive={true}
            />
            <Bar
              dataKey="successful"
              fill="#34d399"
              radius={[8, 8, 0, 0]}
              minPointSize={4}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
