"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@jess/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { Loader2, Globe } from "lucide-react"

interface BrowserData {
  name: string
  value: number
  color: string
}

export function BrowserUsageChart() {
  const [data, setData] = useState<BrowserData[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/browsers")

        if (!res.ok) {
          console.error(`Error ${res.status}: ${res.statusText}`)
          setData([])
          setTotal(0)
          return
        }

        const json = await res.json()

        if (json.success && Array.isArray(json.data)) {
          setData(json.data)
          setTotal(
            json.total ||
              json.data.reduce(
                (sum: number, item: BrowserData) => sum + item.value,
                0
              )
          )
        } else if (Array.isArray(json)) {
          setData(json)
          setTotal(json.reduce((sum, item) => sum + item.value, 0))
        } else {
          setData([])
          setTotal(0)
        }
      } catch (error) {
        console.error("Error fetching browsers:", error)
        setData([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} visitas
          </p>
          <p className="text-xs text-pink-600 font-semibold">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-card border border-border flex flex-col h-[500px]">
      {/* Header - altura fija */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Uso de Navegadores
          </CardTitle>
          <Globe className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col overflow-hidden pt-0">
        {/* Gráfico - altura calculada */}
        <div className="flex-1 relative min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay datos de navegadores
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.05
                      ? `${name} ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={50}
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-muted-foreground">
                      {`${value} (${entry.payload.value})`}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer - altura fija */}
        <div className="text-center pt-4 border-t border-border flex-shrink-0 h-[80px] flex flex-col justify-center">
          <p className="text-2xl font-bold text-foreground">
            {total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Visitas este mes</p>
        </div>
      </CardContent>
    </Card>
  )
}
