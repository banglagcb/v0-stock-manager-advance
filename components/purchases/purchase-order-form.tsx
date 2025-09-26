"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  cost_price: number
  supplier_id?: string
  categories?: { name: string }
  suppliers?: { name: string }
}

interface PurchaseItem {
  product_id: string
  product_name: string
  quantity: number
  unit_cost: number
  total_cost: number
}

interface PurchaseOrderFormProps {
  suppliers: Supplier[]
  products: Product[]
  preselectedSupplierId?: string
}

export function PurchaseOrderForm({ suppliers, products, preselectedSupplierId }: PurchaseOrderFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSupplierId, setSelectedSupplierId] = useState(preselectedSupplierId || "")
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])

  // Filter products by selected supplier
  const availableProducts = products.filter(
    (product) => !selectedSupplierId || product.supplier_id === selectedSupplierId,
  )

  const addPurchaseItem = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existingItem = purchaseItems.find((item) => item.product_id === productId)
    if (existingItem) {
      setPurchaseItems((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                total_cost: (item.quantity + 1) * item.unit_cost,
              }
            : item,
        ),
      )
    } else {
      setPurchaseItems((prev) => [
        ...prev,
        {
          product_id: productId,
          product_name: product.name,
          quantity: 1,
          unit_cost: product.cost_price,
          total_cost: product.cost_price,
        },
      ])
    }
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setPurchaseItems((prev) => prev.filter((item) => item.product_id !== productId))
      return
    }

    setPurchaseItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
              total_cost: quantity * item.unit_cost,
            }
          : item,
      ),
    )
  }

  const updateItemCost = (productId: string, unitCost: number) => {
    setPurchaseItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              unit_cost: unitCost,
              total_cost: item.quantity * unitCost,
            }
          : item,
      ),
    )
  }

  const removeItem = (productId: string) => {
    setPurchaseItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.total_cost, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplierId || purchaseItems.length === 0) {
      setError("Please select a supplier and add at least one item")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Create purchase order
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert([
          {
            supplier_id: selectedSupplierId,
            total_amount: totalAmount,
            status: "pending",
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Create purchase items
      const purchaseItemsData = purchaseItems.map((item) => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
      }))

      const { error: itemsError } = await supabase.from("purchase_items").insert(purchaseItemsData)
      if (itemsError) throw itemsError

      router.push("/dashboard/purchases")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSupplierId && (
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                  <p className="text-sm text-gray-500 mb-3">Cost: ${product.cost_price.toFixed(2)}</p>
                  <Button onClick={() => addPurchaseItem(product.id)} size="sm" className="w-full">
                    Add to Order
                  </Button>
                </div>
              ))}
            </div>
            {availableProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {selectedSupplierId ? "No products available from this supplier" : "Please select a supplier first"}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {purchaseItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseItems.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.product_id, Number.parseInt(e.target.value) || 0)}
                          className="w-20"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItemCost(item.product_id, Number.parseFloat(e.target.value) || 0)}
                          className="w-24"
                          min="0"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">${item.total_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.product_id)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mt-4">{error}</div>
            )}

            <div className="flex space-x-4 mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isLoading ? "Creating Order..." : "Create Purchase Order"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/purchases")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
