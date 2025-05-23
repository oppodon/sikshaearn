"use client"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    earnings: 2000,
  },
  {
    name: "Feb",
    earnings: 3500,
  },
  {
    name: "Mar",
    earnings: 2800,
  },
  {
    name: "Apr",
    earnings: 5400,
  },
  {
    name: "May",
    earnings: 4200,
  },
  {
    name: "Jun",
    earnings: 6800,
  },
  {
    name: "Jul",
    earnings: 7300,
  },
  {
    name: "Aug",
    earnings: 8900,
  },
  {
    name: "Sep",
    earnings: 7600,
  },
  {
    name: "Oct",
    earnings: 9200,
  },
  {
    name: "Nov",
    earnings: 10500,
  },
  {
    name: "Dec",
    earnings: 12000,
  },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rs.${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Earnings</span>
                      <span className="font-bold">Rs. {payload[0].value}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="earnings"
          stroke="#2563eb"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "#2563eb", opacity: 0.8 },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
