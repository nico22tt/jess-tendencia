"use client"

import { Card } from "@jess/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", total: 4000, successful: 2400 },
  { month: "Feb", total: 3000, successful: 1398 },
  { month: "Mar", total: 2000, successful: 9800 },
  { month: "Apr", total: 2780, successful: 3908 },
  { month: "May", total: 1890, successful: 4800 },
  { month: "Jun", total: 2390, successful: 3800 },
  { month: "Jul", total: 3490, successful: 4300 },
  { month: "Aug", total: 4000, successful: 2400 },
  { month: "Sep", total: 3000, successful: 1398 },
  { month: "Oct", total: 2000, successful: 9800 },
  { month: "Nov", total: 2780, successful: 3908 },
  { month: "Dec", total: 1890, successful: 4800 },
]

export function RevenueChart() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Total Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" stroke="#71717a" />
          <YAxis stroke="#71717a" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
          <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} />
          <Bar dataKey="successful" fill="#a855f7" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
