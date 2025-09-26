"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface ReceiveOrderFormProps {
  purchase: any
}

export function ReceiveOrderForm({ purchase }: ReceiveOrderFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receivedItems, setReceivedItems] = useState(
    purchase.purchase_items.map((item: any) => ({
      ...item,
      received_quantity: item.quantity,
    })),
  )
  const [notes, setNotes] = useState("")

  const updateReceivedQuantity = (itemId: string, quantity: number) => {
    setReceivedItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, received_quantity: Math.max(0, quantity) } : item)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Update purchase status
      const { error: purchaseError } = await supabase
        .from("purchases")
        .update({ status: "received" })
        .eq("id", purchase.id)

      if (purchaseError) throw purchaseError

      // Create stock movements for received items
      const stockMovements = receivedItems
        .filter((item) => item.received_quantity > 0)
        .map((item) => ({
          product_id: item.product_id,
          movement_type: "in",
          quantity: item.received_quantity,
          reference_type: "purchase",
          reference_id: purchase.id,
          notes: `Purchase ${purchase.purchase_number}${notes ? ` - ${notes}` : ""}`,
          user_id: user.id,
        }))

      if (stockMovements.length > 0) {
        const { error: movementError } = await supabase.from("stock_movements").insert(stockMovements)
        if (movementError) throw movementError
      }

      router.push("/dashboard/purchases")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receive Items</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Ordered Qty</TableHead>
                  <TableHead>Received Qty</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.products?.name}</TableCell>
                    <TableCell className="font-mono text-sm">{item.products?.sku}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.received_quantity}
                        onChange={(e) => updateReceivedQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                        className="w-20"
                        min="0"
                        max={item.quantity}
                      />
                    </TableCell>
                    <TableCell>${item.unit_cost.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      ${(item.received_quantity * item.unit_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the received items..."
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Received Value:</span>
              <span className="text-xl font-bold text-green-600">
                ${receivedItems.reduce((sum, item) => sum + item.received_quantity * item.unit_cost, 0).toFixed(2)}
              </span>
            </div>
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isLoading ? "Processing..." : "Receive Items"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/purchases")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
