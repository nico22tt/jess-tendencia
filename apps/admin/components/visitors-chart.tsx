"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2, Users } from "lucide-react"

interface VisitorData {
  date: string
  visitors: number
}

export function VisitorsChart() {
  const [data, setData] = useState<VisitorData[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [average, setAverage] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/visitors")

        if (!res.ok) {
          console.error(`Error ${res.status}: ${res.statusText}`)
          setData([])
          setTotal(0)
          setAverage(0)
          return
        }

        const json = await res.json()

        if (json.success && Array.isArray(json.data)) {
          setData(json.data)
          setTotal(
            json.summary?.total ||
              json.data.reduce(
                (sum: number, item: VisitorData) => sum + item.visitors,
                0
              )
          )
          setAverage(json.summary?.averagePerDay || 0)
        } else if (Array.isArray(json)) {
          const mappedData = json.map((item) => ({
            date: item.date,
            visitors: item.count || item.visitors || 0,
          }))
          setData(mappedData)
          const totalVisitors = mappedData.reduce(
            (sum, item) => sum + item.visitors,
            0
          )
          setTotal(totalVisitors)
          setAverage(
            mappedData.length > 0
              ? Math.round(totalVisitors / mappedData.length)
              : 0
          )
        } else {
          setData([])
          setTotal(0)
          setAverage(0)
        }
      } catch (error) {
        console.error("Error fetching visitors:", error)
        setData([])
        setTotal(0)
        setAverage(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("es-CL", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-foreground">
            {formatDate(data.payload.date)}
          </p>
          <p className="text-sm text-green-600 font-bold">
            {data.value.toLocaleString()} visitantes
          </p>
        </div>
      )
    }
    return null
  }

  // ✅ Custom Legend Component
  const CustomLegend = () => {
    if (!data.length || loading) return null
    
    return (
      <div className="flex items-center justify-center gap-8 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span className="text-xs text-muted-foreground">
            Promedio: {average.toLocaleString()}/día
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600/50"></div>
          <span className="text-xs text-muted-foreground">
            Días con datos: {data.length}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-card border border-border p-5 flex flex-col h-[300px]">
      {/* Header - altura fija */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">
            Visitantes Totales
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Este mes</p>
          <p className="text-base font-bold text-green-600">
            {total.toLocaleString()}
          </p>
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay datos de visitantes
              </p>
            </div>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatDate}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {/* ✅ Legend integrada como en Revenue Chart */}
            <Legend 
              content={<CustomLegend />}
              wrapperStyle={{
                paddingTop: "10px",
              }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisitors)"
              isAnimationActive={!loading}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
