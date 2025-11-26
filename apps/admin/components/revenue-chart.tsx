"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const formatNumber = (value: number | string) =>
  Number(value).toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })

export function RevenueChart() {
  const [data, setData] = useState<{month: string, total: number, successful: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/revenue")
        const json = await res.json()
        // Asegúrate que siempre se setea un array
        setData(Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []))
      } catch {
        setData([])
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresca cada 30s
    return () => clearInterval(interval)
  }, [])

  const totalSum = data.reduce((a, b) => a + (b.total ?? 0), 0)

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Ingresos mensuales</h3>
        <span className="text-base font-bold text-blue-400 px-3 py-1 rounded bg-blue-950/60">
          Total año: {formatNumber(totalSum)}
        </span>
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-60 flex items-center justify-center text-zinc-400">Cargando datos...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="2 2" stroke="#34344a" />
              <XAxis dataKey="month" stroke="#d1d5db" />
              <YAxis stroke="#d1d5db" tickFormatter={formatNumber} />
              <Tooltip
                formatter={formatNumber}
                labelStyle={{ color: "#2563eb", fontWeight: 700 }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #34344a",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: 14,
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                formatter={(value) =>
                  value === "total"
                    ? "Total de ventas"
                    : value === "successful"
                    ? "Transacciones exitosas"
                    : value
                }
                wrapperStyle={{ color: "#e5e5e5", fontSize: "15px" }}
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
        )}
      </div>
    </Card>
  )
}
