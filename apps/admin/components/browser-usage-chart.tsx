"use client"

import { Card } from "@jess/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const data = [
  { name: "Chrome", value: 45, color: "#6366f1" },
  { name: "Safari", value: 25, color: "#a855f7" },
  { name: "Firefox", value: 18, color: "#ec4899" },
  { name: "Edge", value: 12, color: "#8b5cf6" },
]

const totalVisitors = data.reduce((sum, item) => sum + item.value, 0) * 10

export function BrowserUsageChart() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Browser Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-zinc-300 text-sm">{`${value} (${entry.payload.value}%)`}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-2xl font-bold text-white">{totalVisitors.toLocaleString()}</p>
        <p className="text-sm text-zinc-400">Total Visitors</p>
      </div>
    </Card>
  )
}
