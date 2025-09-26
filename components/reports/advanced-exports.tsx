"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface AdvancedExportsProps {
  salesData: any[]
  productsData: any[]
  categoriesData: any[]
  suppliersData?: any[]
  purchasesData?: any[]
}

export function AdvancedExports({
  salesData,
  productsData,
  categoriesData,
  suppliersData = [],
  purchasesData = [],
}: AdvancedExportsProps) {
  const [exportType, setExportType] = useState("comprehensive")
  const [selectedFields, setSelectedFields] = useState<string[]>(["products", "sales", "inventory", "categories"])
  const [customReportName, setCustomReportName] = useState("")
  const [reportNotes, setReportNotes] = useState("")

  const exportOptions = [
    { id: "comprehensive", name: "Comprehensive Report", description: "All data with detailed analytics" },
    { id: "financial", name: "Financial Summary", description: "Sales, profits, and financial metrics" },
    { id: "inventory", name: "Inventory Analysis", description: "Stock levels, movements, and valuations" },
    { id: "performance", name: "Performance Report", description: "Top products, categories, and trends" },
    { id: "custom", name: "Custom Export", description: "Select specific data fields" },
  ]

  const dataFields = [
    { id: "products", name: "Products", description: "Product details, pricing, and specifications" },
    { id: "sales", name: "Sales Data", description: "Transaction history and customer purchases" },
    { id: "inventory", name: "Inventory", description: "Stock levels and movements" },
    { id: "categories", name: "Categories", description: "Product categorization and performance" },
    { id: "suppliers", name: "Suppliers", description: "Supplier information and purchase history" },
    { id: "analytics", name: "Analytics", description: "Calculated metrics and insights" },
  ]

  const generateComprehensiveReport = () => {
    const report = {
      metadata: {
        reportName: customReportName || "Comprehensive Business Report",
        generatedAt: new Date().toISOString(),
        dateRange: "All Time",
        notes: reportNotes,
      },
      summary: {
        totalProducts: productsData.length,
        totalCategories: categoriesData.length,
        totalSales: salesData.reduce((sum, sale) => sum + sale.total_amount, 0),
        totalTransactions: salesData.length,
        averageOrderValue:
          salesData.length > 0 ? salesData.reduce((sum, sale) => sum + sale.total_amount, 0) / salesData.length : 0,
      },
      products: selectedFields.includes("products")
        ? productsData.map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.categories?.name,
            supplier: product.suppliers?.name,
            costPrice: product.cost_price,
            sellingPrice: product.selling_price,
            stockQuantity: product.stock_quantity,
            reorderLevel: product.reorder_level,
            status: product.status,
          }))
        : [],
      sales: selectedFields.includes("sales")
        ? salesData.map((sale) => ({
            id: sale.id,
            date: sale.created_at,
            totalAmount: sale.total_amount,
            paymentMethod: sale.payment_method,
            items: sale.sale_items?.map((item: any) => ({
              productName: item.products?.name,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price,
            })),
          }))
        : [],
      categories: selectedFields.includes("categories")
        ? categoriesData.map((category) => {
            const categoryProducts = productsData.filter((p) => p.category_id === category.id)
            const categorySales = salesData.reduce((total, sale) => {
              const categoryItems =
                sale.sale_items?.filter((item: any) => categoryProducts.some((p) => p.id === item.product_id)) || []
              return total + categoryItems.reduce((sum: number, item: any) => sum + item.total_price, 0)
            }, 0)

            return {
              id: category.id,
              name: category.name,
              description: category.description,
              productCount: categoryProducts.length,
              totalSales: categorySales,
              stockValue: categoryProducts.reduce((sum, p) => sum + p.stock_quantity * p.cost_price, 0),
            }
          })
        : [],
      analytics: selectedFields.includes("analytics")
        ? {
            topSellingProducts: productsData
              .map((product) => {
                const productSales = salesData.reduce((total, sale) => {
                  const productItems = sale.sale_items?.filter((item: any) => item.product_id === product.id) || []
                  return total + productItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
                }, 0)
                return { ...product, totalSold: productSales }
              })
              .sort((a, b) => b.totalSold - a.totalSold)
              .slice(0, 10),
            lowStockProducts: productsData.filter((p) => p.stock_quantity <= p.reorder_level),
            salesTrends: generateSalesTrends(),
          }
        : null,
    }

    return report
  }

  const generateSalesTrends = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last30Days.map((date) => {
      const daySales = salesData.filter((sale) => sale.created_at.split("T")[0] === date)
      return {
        date,
        sales: daySales.reduce((sum, sale) => sum + sale.total_amount, 0),
        transactions: daySales.length,
      }
    })
  }

  const exportToJSON = () => {
    const report = generateComprehensiveReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${customReportName || "comprehensive-report"}-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const report = generateComprehensiveReport()
    let csvContent = ""

    // Add metadata
    csvContent += "STOCK MANAGER ADVANCED - COMPREHENSIVE REPORT\n"
    csvContent += `Generated: ${report.metadata.generatedAt}\n`
    csvContent += `Report: ${report.metadata.reportName}\n\n`

    // Add summary
    csvContent += "BUSINESS SUMMARY\n"
    csvContent += "Metric,Value\n"
    Object.entries(report.summary).forEach(([key, value]) => {
      csvContent += `${key.replace(/([A-Z])/g, " $1").toLowerCase()},${value}\n`
    })
    csvContent += "\n"

    // Add products if selected
    if (selectedFields.includes("products") && report.products.length > 0) {
      csvContent += "PRODUCTS\n"
      csvContent += "ID,Name,SKU,Category,Supplier,Cost Price,Selling Price,Stock,Reorder Level,Status\n"
      report.products.forEach((product) => {
        csvContent += `${product.id},${product.name},${product.sku},${product.category || "N/A"},${product.supplier || "N/A"},${product.costPrice},${product.sellingPrice},${product.stockQuantity},${product.reorderLevel},${product.status}\n`
      })
      csvContent += "\n"
    }

    // Add categories if selected
    if (selectedFields.includes("categories") && report.categories.length > 0) {
      csvContent += "CATEGORIES PERFORMANCE\n"
      csvContent += "ID,Name,Description,Products,Total Sales,Stock Value\n"
      report.categories.forEach((category) => {
        csvContent += `${category.id},${category.name},${category.description || "N/A"},${category.productCount},${category.totalSales.toFixed(2)},${category.stockValue.toFixed(2)}\n`
      })
      csvContent += "\n"
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${customReportName || "comprehensive-report"}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    const report = generateComprehensiveReport()

    // Create a formatted HTML report for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.metadata.reportName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
          .section { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f4f8; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Stock Manager Advanced</h1>
          <h2>${report.metadata.reportName}</h2>
          <p>Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h3>Business Summary</h3>
          <div class="metric">Total Products: <strong>${report.summary.totalProducts}</strong></div>
          <div class="metric">Total Sales: <strong>$${report.summary.totalSales.toFixed(2)}</strong></div>
          <div class="metric">Transactions: <strong>${report.summary.totalTransactions}</strong></div>
          <div class="metric">Avg Order Value: <strong>$${report.summary.averageOrderValue.toFixed(2)}</strong></div>
        </div>

        ${
          selectedFields.includes("categories")
            ? `
        <div class="section">
          <h3>Category Performance</h3>
          <table>
            <tr><th>Category</th><th>Products</th><th>Sales</th><th>Stock Value</th></tr>
            ${report.categories
              .map(
                (cat) => `
              <tr>
                <td>${cat.name}</td>
                <td>${cat.productCount}</td>
                <td>$${cat.totalSales.toFixed(2)}</td>
                <td>$${cat.stockValue.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>
        `
            : ""
        }

        ${
          report.analytics && selectedFields.includes("analytics")
            ? `
        <div class="section">
          <h3>Top Selling Products</h3>
          <table>
            <tr><th>Product</th><th>SKU</th><th>Quantity Sold</th><th>Stock</th></tr>
            ${report.analytics.topSellingProducts
              .slice(0, 10)
              .map(
                (product) => `
              <tr>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${product.totalSold}</td>
                <td>${product.stock_quantity}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>
        `
            : ""
        }
      </body>
      </html>
    `

    // Open in new window for printing/PDF save
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Export Options</CardTitle>
          <CardDescription>Generate comprehensive reports with customizable data fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-2">
            <Label>Export Type</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Report Name */}
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="Enter custom report name"
              value={customReportName}
              onChange={(e) => setCustomReportName(e.target.value)}
            />
          </div>

          {/* Data Fields Selection */}
          {exportType === "custom" && (
            <div className="space-y-3">
              <Label>Select Data Fields</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dataFields.map((field) => (
                  <div key={field.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFields([...selectedFields, field.id])
                        } else {
                          setSelectedFields(selectedFields.filter((f) => f !== field.id))
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.name}
                      </Label>
                      <p className="text-xs text-gray-500">{field.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Report Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or comments about this report"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={exportToCSV} variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </Button>
            <Button onClick={exportToJSON} variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Export JSON
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Actions</CardTitle>
          <CardDescription>Pre-configured exports for common business needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
              onClick={() => {
                setExportType("financial")
                setSelectedFields(["sales", "analytics"])
                setCustomReportName("Financial Summary Report")
                exportToCSV()
              }}
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <span className="text-sm font-medium">Financial Report</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
              onClick={() => {
                setExportType("inventory")
                setSelectedFields(["products", "inventory", "categories"])
                setCustomReportName("Inventory Analysis Report")
                exportToCSV()
              }}
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="text-sm font-medium">Inventory Report</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
              onClick={() => {
                setExportType("performance")
                setSelectedFields(["products", "sales", "categories", "analytics"])
                setCustomReportName("Performance Analysis Report")
                exportToCSV()
              }}
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm font-medium">Performance Report</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
              onClick={() => {
                setExportType("comprehensive")
                setSelectedFields(["products", "sales", "inventory", "categories", "analytics"])
                setCustomReportName("Complete Business Report")
                exportToJSON()
              }}
            >
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">Complete Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
