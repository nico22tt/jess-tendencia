"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

// Colores para los diferentes navegadores y otros
const BROWSER_COLORS: Record<string, string> = {
  Chrome: "#6366f1",
  Safari: "#a855f7",
  Firefox: "#ec4899",
  Edge: "#8b5cf6",
  Otros: "#06b6d4"
}

export function BrowserUsageChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/browsers")
        const browsers = await res.json()
        // Aseguramos que browsers es un array, si no, dejamos []
        setData(Array.isArray(browsers) ? browsers : [])
      } catch {
        setData([])
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Seguridad: evitamos el error de .reduce is not a function
  const totalVisitors = Array.isArray(data)
    ? data.reduce((sum, item) => sum + item.value, 0)
    : 0

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Uso de navegadores</h3>
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-60 flex items-center justify-center text-zinc-400">
            Cargando datos...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BROWSER_COLORS[entry.name] ?? "#06b6d4"}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-zinc-300 text-sm">
                    {`${value} (${entry.payload.value} visitas)`}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="text-center mt-4">
        <p className="text-xl font-bold text-white">{totalVisitors.toLocaleString()}</p>
        <p className="text-sm text-zinc-400">Visitantes totales</p>
      </div>
    </Card>
  )
}
