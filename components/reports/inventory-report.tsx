"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface InventoryReportProps {
  productsData: any[]
}

export function InventoryReport({ productsData }: InventoryReportProps) {
  const totalProducts = productsData.length
  const activeProducts = productsData.filter((p) => p.status === "active").length
  const lowStockProducts = productsData.filter((p) => p.stock_quantity <= p.min_stock_level).length
  const outOfStockProducts = productsData.filter((p) => p.stock_quantity === 0).length
  const totalInventoryValue = productsData.reduce(
    (sum, product) => sum + product.stock_quantity * product.cost_price,
    0,
  )

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "destructive" }
    if (quantity <= minLevel) return { label: "Low Stock", color: "secondary" }
    return { label: "In Stock", color: "default" }
  }

  const exportToCSV = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Supplier",
      "Stock Quantity",
      "Min Level",
      "Cost Price",
      "Selling Price",
      "Status",
    ]
    const csvData = productsData.map((product) => [
      product.name,
      product.sku,
      product.categories?.name || "N/A",
      product.suppliers?.name || "N/A",
      product.stock_quantity,
      product.min_stock_level,
      product.cost_price.toFixed(2),
      product.selling_price.toFixed(2),
      product.status,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            <p className="text-sm text-gray-600">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <p className="text-sm text-gray-600">Active Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{lowStockProducts}</div>
            <p className="text-sm text-gray-600">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Complete inventory status report</CardDescription>
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
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level)
                  const inventoryValue = product.stock_quantity * product.cost_price
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.categories?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{product.stock_quantity}</span>
                          <Badge variant={stockStatus.color as any} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{product.min_stock_level}</TableCell>
                      <TableCell>${product.cost_price.toFixed(2)}</TableCell>
                      <TableCell>${product.selling_price.toFixed(2)}</TableCell>
                      <TableCell>${inventoryValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
