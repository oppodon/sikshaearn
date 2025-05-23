"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"

const data = [
  { name: "Rahul Sharma", value: 12450 },
  { name: "Priya Patel", value: 9800 },
  { name: "Ananya Desai", value: 10500 },
  { name: "Neha Gupta", value: 7500 },
  { name: "Rajesh Khanna", value: 6000 },
  { name: "Others", value: 18200 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"]

export function AffiliatePerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
