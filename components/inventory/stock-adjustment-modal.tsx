"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  sku: string
  stock_quantity: number
  unit: string
}

interface StockAdjustmentModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function StockAdjustmentModal({ product, isOpen, onClose }: StockAdjustmentModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    movement_type: "adjustment",
    quantity: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const quantity = Number.parseInt(formData.quantity)
      if (isNaN(quantity)) throw new Error("Invalid quantity")

      // Create stock movement record
      const { error: movementError } = await supabase.from("stock_movements").insert([
        {
          product_id: product.id,
          movement_type: formData.movement_type,
          quantity: formData.movement_type === "adjustment" ? quantity : Math.abs(quantity),
          reference_type: "adjustment",
          notes: formData.notes,
          user_id: user.id,
        },
      ])

      if (movementError) throw movementError

      // The trigger will automatically update the product stock
      router.refresh()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock - {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Stock</Label>
            <div className="text-lg font-medium">
              {product.stock_quantity} {product.unit}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement_type">Adjustment Type</Label>
            <Select value={formData.movement_type} onValueChange={(value) => handleChange("movement_type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stock In (+)</SelectItem>
                <SelectItem value="out">Stock Out (-)</SelectItem>
                <SelectItem value="adjustment">Set Exact Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {formData.movement_type === "adjustment" ? "New Stock Quantity" : "Quantity to Adjust"}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Reason for adjustment..."
              rows={3}
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isLoading ? "Adjusting..." : "Adjust Stock"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
