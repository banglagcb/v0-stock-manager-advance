"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SalesData {
  total_amount: number
  created_at: string
}

interface SalesChartProps {
  salesData: SalesData[]
}

export function SalesChart({ salesData }: SalesChartProps) {
  // Group sales by date
  const chartData = salesData.reduce(
    (acc, sale) => {
      const date = new Date(sale.created_at).toLocaleDateString()
      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.revenue += sale.total_amount
        existing.sales += 1
      } else {
        acc.push({
          date,
          revenue: sale.total_amount,
          sales: 1,
        })
      }
      return acc
    },
    [] as Array<{ date: string; revenue: number; sales: number }>,
  )

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Daily revenue over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "revenue" ? `$${value.toFixed(2)}` : value,
                  name === "revenue" ? "Revenue" : "Sales",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
