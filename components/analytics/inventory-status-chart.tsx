"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface InventoryStats {
  inStock: number
  lowStock: number
  outOfStock: number
}

interface InventoryStatusChartProps {
  inventoryStats: InventoryStats
}

export function InventoryStatusChart({ inventoryStats }: InventoryStatusChartProps) {
  const data = [
    { name: "In Stock", value: inventoryStats.inStock, color: "#10b981" },
    { name: "Low Stock", value: inventoryStats.lowStock, color: "#f59e0b" },
    { name: "Out of Stock", value: inventoryStats.outOfStock, color: "#ef4444" },
  ]

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
        <CardDescription>Current stock level distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Products"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
