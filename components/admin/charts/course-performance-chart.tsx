"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  {
    name: "Digital Marketing",
    enrollments: 342,
    revenue: 512850,
    completionRate: 45,
  },
  {
    name: "Communication Skills",
    enrollments: 256,
    revenue: 230144,
    completionRate: 52,
  },
  {
    name: "Facebook Ads",
    enrollments: 189,
    revenue: 245511,
    completionRate: 38,
  },
  {
    name: "YouTube Mastery",
    enrollments: 215,
    revenue: 343785,
    completionRate: 41,
  },
  {
    name: "Video Editing",
    enrollments: 178,
    revenue: 231322,
    completionRate: 36,
  },
]

export function CoursePerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" orientation="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "revenue") return [`₹${value.toLocaleString()}`, "Revenue"]
            if (name === "enrollments") return [`${value}`, "Enrollments"]
            if (name === "completionRate") return [`${value}%`, "Completion Rate"]
            return [value, name]
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="enrollments" fill="#3b82f6" name="Enrollments" />
        <Bar yAxisId="right" dataKey="completionRate" fill="#10b981" name="Completion Rate" />
      </BarChart>
    </ResponsiveContainer>
  )
}
