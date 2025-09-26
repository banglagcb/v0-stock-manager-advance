"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SalesReport } from "./sales-report"
import { InventoryReport } from "./inventory-report"
import { CategoryReport } from "./category-report"
import { AdvancedExports } from "./advanced-exports"

interface ReportsInterfaceProps {
  salesData: any[]
  productsData: any[]
  categoriesData: any[]
}

export function ReportsInterface({ salesData, productsData, categoriesData }: ReportsInterfaceProps) {
  const [activeReport, setActiveReport] = useState("sales")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  const reportTypes = [
    { id: "sales", name: "Sales Report", description: "Detailed sales analysis and trends" },
    { id: "inventory", name: "Inventory Report", description: "Stock levels and product performance" },
    { id: "category", name: "Category Report", description: "Performance by product categories" },
    { id: "exports", name: "Advanced Exports", description: "Comprehensive data export and reporting" },
  ]

  const filteredSalesData = salesData.filter((sale) => {
    const saleDate = new Date(sale.created_at).toISOString().split("T")[0]
    return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate
  })

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all ${
              activeReport === report.id ? "ring-2 ring-amber-500 bg-amber-50" : "hover:shadow-md"
            }`}
            onClick={() => setActiveReport(report.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Date Range Filter - Hide for exports */}
      {activeReport !== "exports" && (
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDateRange({
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                      endDate: new Date().toISOString().split("T")[0],
                    })
                  }
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setDateRange({
                      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                      endDate: new Date().toISOString().split("T")[0],
                    })
                  }
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      {activeReport === "sales" && <SalesReport salesData={filteredSalesData} dateRange={dateRange} />}
      {activeReport === "inventory" && <InventoryReport productsData={productsData} />}
      {activeReport === "category" && (
        <CategoryReport categoriesData={categoriesData} salesData={filteredSalesData} productsData={productsData} />
      )}
      {activeReport === "exports" && (
        <AdvancedExports salesData={salesData} productsData={productsData} categoriesData={categoriesData} />
      )}
    </div>
  )
}
