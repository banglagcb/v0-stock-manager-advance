"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Product {
  id: string
  name: string
  sku: string
  stock_quantity: number
  min_stock_level: number
  selling_price: number
  cost_price: number
  status: string
  categories?: { name: string }
  suppliers?: { name: string }
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (productId: string) => {
    setDeletingId(productId)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== productId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "destructive" }
    if (quantity <= minLevel) return { label: "Low Stock", color: "secondary" }
    return { label: "In Stock", color: "default" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="block lg:hidden space-y-4">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level)
            return (
              <Card key={product.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                    </div>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{product.categories?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Supplier:</span>
                      <p className="font-medium">{product.suppliers?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{product.stock_quantity}</span>
                        <Badge variant={stockStatus.color as any} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-medium">${product.selling_price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button variant="outline" size="sm" className="flex-1 min-w-[80px] bg-transparent">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/dashboard/inventory/${product.id}`}>
                      <Button variant="outline" size="sm" className="flex-1 min-w-[80px] bg-transparent">
                        Stock
                      </Button>
                    </Link>
                    <DeleteConfirmationDialog
                      title="Delete Product"
                      description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                      onConfirm={() => handleDelete(product.id)}
                      isLoading={deletingId === product.id}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level)
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.categories?.name || "N/A"}</TableCell>
                    <TableCell>{product.suppliers?.name || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{product.stock_quantity}</span>
                        <Badge variant={stockStatus.color as any} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>${product.cost_price.toFixed(2)}</TableCell>
                    <TableCell>${product.selling_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/dashboard/inventory/${product.id}`}>
                          <Button variant="outline" size="sm">
                            Stock
                          </Button>
                        </Link>
                        <DeleteConfirmationDialog
                          title="Delete Product"
                          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                          onConfirm={() => handleDelete(product.id)}
                          isLoading={deletingId === product.id}
                        />
                      </div>
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
  )
}
