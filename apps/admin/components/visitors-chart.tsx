"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function VisitorsChart() {
  const [data, setData] = useState<{date: string, count: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/visitors")
        const json = await res.json()
        setData(json)
      } catch {
        setData([])
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Visitantes totales</h3>
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-60 flex items-center justify-center text-zinc-400">Cargando datos...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                formatter={(value) => `${value} visitas`}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorVisitors)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
