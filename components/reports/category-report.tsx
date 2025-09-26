"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CategoryReportProps {
  categoriesData: any[]
  salesData: any[]
  productsData: any[]
}

export function CategoryReport({ categoriesData, salesData, productsData }: CategoryReportProps) {
  // Calculate category performance
  const categoryPerformance = categoriesData.map((category) => {
    const categoryProducts = productsData.filter((p) => p.category_id === category.id)
    const categoryProductIds = categoryProducts.map((p) => p.id)

    // Calculate sales for this category
    const categorySales = salesData.reduce((total, sale) => {
      const categoryItems = sale.sale_items?.filter((item: any) => categoryProductIds.includes(item.product_id)) || []
      return total + categoryItems.reduce((sum: number, item: any) => sum + item.total_price, 0)
    }, 0)

    const totalQuantitySold = salesData.reduce((total, sale) => {
      const categoryItems = sale.sale_items?.filter((item: any) => categoryProductIds.includes(item.product_id)) || []
      return total + categoryItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    }, 0)

    const totalStock = categoryProducts.reduce((sum, product) => sum + product.stock_quantity, 0)
    const totalValue = categoryProducts.reduce((sum, product) => sum + product.stock_quantity * product.cost_price, 0)

    return {
      ...category,
      productCount: categoryProducts.length,
      totalSales: categorySales,
      quantitySold: totalQuantitySold,
      totalStock,
      totalValue,
    }
  })

  // Sort by sales performance
  categoryPerformance.sort((a, b) => b.totalSales - a.totalSales)

  const exportToCSV = () => {
    const headers = ["Category", "Products", "Total Sales", "Quantity Sold", "Stock Value", "Description"]
    const csvData = categoryPerformance.map((category) => [
      category.name,
      category.productCount,
      category.totalSales.toFixed(2),
      category.quantitySold,
      category.totalValue.toFixed(2),
      category.description || "N/A",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `category-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{categoriesData.length}</div>
            <p className="text-sm text-gray-600">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ${categoryPerformance.reduce((sum, cat) => sum + cat.totalSales, 0).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Total Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {categoryPerformance.reduce((sum, cat) => sum + cat.quantitySold, 0)}
            </div>
            <p className="text-sm text-gray-600">Items Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ${categoryPerformance.reduce((sum, cat) => sum + cat.totalValue, 0).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Stock Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Sales and inventory performance by category</CardDescription>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Stock Value</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryPerformance.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.productCount}</TableCell>
                    <TableCell className="font-semibold text-green-600">${category.totalSales.toFixed(2)}</TableCell>
                    <TableCell>{category.quantitySold}</TableCell>
                    <TableCell>{category.totalStock}</TableCell>
                    <TableCell>${category.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">#{index + 1}</div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0 ? "bg-green-500" : index < 3 ? "bg-amber-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
