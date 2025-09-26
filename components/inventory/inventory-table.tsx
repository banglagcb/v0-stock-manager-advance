"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockAdjustmentModal } from "./stock-adjustment-modal"

interface Product {
  id: string
  name: string
  sku: string
  stock_quantity: number
  min_stock_level: number
  max_stock_level: number
  unit: string
  categories?: { name: string }
}

interface InventoryTableProps {
  products: Product[]
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatus = (quantity: number, minLevel: number, maxLevel: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "destructive" }
    if (quantity <= minLevel) return { label: "Low Stock", color: "secondary" }
    if (quantity >= maxLevel) return { label: "Overstock", color: "default" }
    return { label: "Normal", color: "default" }
  }

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Max Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stock_quantity,
                    product.min_stock_level,
                    product.max_stock_level,
                  )
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.categories?.name || "N/A"}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {product.stock_quantity} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>{product.min_stock_level}</TableCell>
                      <TableCell>{product.max_stock_level}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.color as any}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleAdjustStock(product)}>
                          Adjust Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">No products found matching your criteria.</div>
          )}
        </CardContent>
      </Card>

      <StockAdjustmentModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
      />
    </>
  )
}
