"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Sale {
  id: string
  sale_number: string
  customer_name?: string
  total_amount: number
  payment_method: string
  created_at: string
  profiles?: { full_name: string }
}

interface RecentActivityProps {
  recentSales: Sale[]
}

export function RecentActivity({ recentSales }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Latest transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent sales</div>
          ) : (
            recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{sale.sale_number}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {sale.payment_method}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {sale.customer_name || "Walk-in Customer"} • {sale.profiles?.full_name || "Staff"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString()}{" "}
                    {new Date(sale.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">${sale.total_amount.toFixed(2)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
