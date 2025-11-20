"use client"

import { Card } from "@jess/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan 1", visitors: 400 },
  { date: "Jan 8", visitors: 300 },
  { date: "Jan 15", visitors: 600 },
  { date: "Jan 22", visitors: 800 },
  { date: "Jan 29", visitors: 500 },
  { date: "Feb 5", visitors: 700 },
  { date: "Feb 12", visitors: 900 },
  { date: "Feb 19", visitors: 1100 },
  { date: "Feb 26", visitors: 1000 },
  { date: "Mar 5", visitors: 1200 },
]

export function VisitorsChart() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Total Visitors</h3>
      <ResponsiveContainer width="100%" height={300}>
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
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Area type="monotone" dataKey="visitors" stroke="#10b981" fillOpacity={1} fill="url(#colorVisitors)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
