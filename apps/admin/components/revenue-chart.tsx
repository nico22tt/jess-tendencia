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

const formatNumber = (value: number | string) =>
  Number(value).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  })

interface RevenueData {
  month: string
  total: number
  successful: number
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/revenue")

        if (!res.ok) {
          console.error(`Error ${res.status}: ${res.statusText}`)
          setData([])
          setTotalRevenue(0)
          return
        }

        const json = await res.json()

        if (json.success && Array.isArray(json.data)) {
          setData(json.data)
          setYear(json.year || new Date().getFullYear())
          setTotalRevenue(
            json.summary?.totalRevenue ||
              json.data.reduce(
                (sum: number, item: RevenueData) => sum + item.total,
                0
              )
          )
        } else if (Array.isArray(json)) {
          setData(json)
          setTotalRevenue(
            json.reduce((sum, item) => sum + (item.total ?? 0), 0)
          )
        } else {
          setData([])
          setTotalRevenue(0)
        }
      } catch (error) {
        console.error("Error fetching revenue:", error)
        setData([])
        setTotalRevenue(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-card border border-border p-5 flex flex-col h-[300px]">
      {/* Header - altura fija */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">
            Ingresos Mensuales
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">
            Total año {year}
          </span>
          <span className="text-base font-bold text-green-600">
            {formatNumber(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Gráfico - altura calculada automáticamente */}
      <div className="relative flex-1">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Cargando datos...
              </span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay datos de ingresos
              </p>
            </div>
          </div>
        ) : null}

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
              tickFormatter={formatNumber}
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number) => formatNumber(value)}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontWeight: 600,
                marginBottom: "8px",
              }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
                fontSize: 13,
                padding: "12px",
              }}
              itemStyle={{
                color: "hsl(var(--foreground))",
                fontSize: 13,
              }}
            />
            <Legend
              formatter={(value) =>
                value === "total"
                  ? "Total de Ventas"
                  : value === "successful"
                  ? "Transacciones Exitosas"
                  : value
              }
              wrapperStyle={{
                color: "hsl(var(--muted-foreground))",
                fontSize: "13px",
                paddingTop: "10px",
              }}
              iconType="circle"
            />
            <Bar
              dataKey="total"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              minPointSize={3}
              isAnimationActive={!loading}
            />
            <Bar
              dataKey="successful"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              minPointSize={3}
              isAnimationActive={!loading}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
