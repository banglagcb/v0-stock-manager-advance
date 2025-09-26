"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SalesReportProps {
  salesData: any[]
  dateRange: { startDate: string; endDate: string }
}

export function SalesReport({ salesData, dateRange }: SalesReportProps) {
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalTransactions = salesData.length
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  const totalTax = salesData.reduce((sum, sale) => sum + sale.tax_amount, 0)
  const totalDiscount = salesData.reduce((sum, sale) => sum + sale.discount_amount, 0)

  const paymentMethodBreakdown = salesData.reduce(
    (acc, sale) => {
      acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount
      return acc
    },
    {} as Record<string, number>,
  )

  const exportToCSV = () => {
    const headers = ["Sale Number", "Date", "Customer", "Total", "Payment Method", "Staff"]
    const csvData = salesData.map((sale) => [
      sale.sale_number,
      new Date(sale.created_at).toLocaleDateString(),
      sale.customer_name || "Walk-in",
      sale.total_amount.toFixed(2),
      sale.payment_method,
      sale.profiles?.full_name || "N/A",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">${averageTransaction.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Average Transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">${totalTax.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Total Tax Collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(paymentMethodBreakdown).map(([method, amount]) => (
              <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold capitalize">{method}</div>
                <div className="text-lg text-green-600">${amount.toFixed(2)}</div>
                <div className="text-sm text-gray-500">{((amount / totalRevenue) * 100).toFixed(1)}% of total</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Transactions</CardTitle>
            <CardDescription>
              {dateRange.startDate} to {dateRange.endDate}
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Staff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.slice(0, 50).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">{sale.sale_number}</TableCell>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.customer_name || "Walk-in"}</TableCell>
                    <TableCell>{sale.sale_items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">${sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{sale.payment_method}</TableCell>
                    <TableCell>{sale.profiles?.full_name || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {salesData.length > 50 && <div className="text-center py-4 text-gray-500">Showing first 50 transactions</div>}
        </CardContent>
      </Card>
    </div>
  )
}
