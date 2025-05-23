"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", earnings: 4000 },
  { name: "Feb", earnings: 3000 },
  { name: "Mar", earnings: 5000 },
  { name: "Apr", earnings: 4500 },
  { name: "May", earnings: 6000 },
  { name: "Jun", earnings: 5500 },
  { name: "Jul", earnings: 7000 },
  { name: "Aug", earnings: 6500 },
  { name: "Sep", earnings: 8000 },
  { name: "Oct", earnings: 7500 },
  { name: "Nov", earnings: 9000 },
  { name: "Dec", earnings: 8500 },
]

export function AffiliateChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rs. ${value}`}
        />
        <Tooltip formatter={(value) => [`Rs. ${value}`, "Earnings"]} labelStyle={{ color: "#000" }} />
        <Area type="monotone" dataKey="earnings" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
