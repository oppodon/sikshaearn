"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", enrollments: 120 },
  { month: "Feb", enrollments: 145 },
  { month: "Mar", enrollments: 132 },
  { month: "Apr", enrollments: 178 },
  { month: "May", enrollments: 156 },
  { month: "Jun", enrollments: 198 },
  { month: "Jul", enrollments: 210 },
  { month: "Aug", enrollments: 232 },
  { month: "Sep", enrollments: 245 },
  { month: "Oct", enrollments: 267 },
  { month: "Nov", enrollments: 289 },
  { month: "Dec", enrollments: 312 },
]

export function EnrollmentChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value: number) => [`${value}`, "Enrollments"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar dataKey="enrollments" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
