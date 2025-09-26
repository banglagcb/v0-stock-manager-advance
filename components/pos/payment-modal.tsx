"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ReceiptModal } from "./receipt-modal"

interface CartItem {
  id: string
  name: string
  selling_price: number
  quantity: number
  total: number
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  subtotal: number
  taxAmount: number
  total: number
  onPaymentComplete: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  taxAmount,
  total,
  onPaymentComplete,
}: PaymentModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [saleData, setSaleData] = useState<any>(null)

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    payment_method: "cash",
    discount_amount: "0",
    amount_received: total.toString(),
  })

  const discountAmount = Number.parseFloat(formData.discount_amount) || 0
  const finalTotal = total - discountAmount
  const amountReceived = Number.parseFloat(formData.amount_received) || 0
  const changeAmount = amountReceived - finalTotal

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

      if (formData.payment_method === "cash" && amountReceived < finalTotal) {
        throw new Error("Insufficient payment amount")
      }

      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            customer_name: formData.customer_name || null,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            subtotal: subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: finalTotal,
            payment_method: formData.payment_method,
            payment_status: "completed",
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = cartItems.map((item) => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.selling_price,
        total_price: item.total,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)
      if (itemsError) throw itemsError

      // Create stock movements for each item
      const stockMovements = cartItems.map((item) => ({
        product_id: item.id,
        movement_type: "out",
        quantity: item.quantity,
        reference_type: "sale",
        reference_id: sale.id,
        notes: `Sale ${sale.sale_number}`,
        user_id: user.id,
      }))

      const { error: movementError } = await supabase.from("stock_movements").insert(stockMovements)
      if (movementError) throw movementError

      // Prepare receipt data
      setSaleData({
        ...sale,
        items: cartItems,
        change_amount: changeAmount,
        amount_received: amountReceived,
      })

      setShowReceipt(true)
      onPaymentComplete()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        payment_method: "cash",
        discount_amount: "0",
        amount_received: total.toString(),
      })
      setError(null)
    }
  }

  return (
    <>
      <Dialog open={isOpen && !showReceipt} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="font-medium">Customer Information (Optional)</h4>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange("customer_name", e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleChange("customer_email", e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleChange("customer_phone", e.target.value)}
                    placeholder="Phone"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Details */}
            <div className="space-y-3">
              <h4 className="font-medium">Payment Details</h4>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleChange("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="digital">Digital Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_amount">Discount Amount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => handleChange("discount_amount", e.target.value)}
                />
              </div>

              {formData.payment_method === "cash" && (
                <div className="space-y-2">
                  <Label htmlFor="amount_received">Amount Received</Label>
                  <Input
                    id="amount_received"
                    type="number"
                    step="0.01"
                    value={formData.amount_received}
                    onChange={(e) => handleChange("amount_received", e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              {formData.payment_method === "cash" && amountReceived >= finalTotal && (
                <div className="flex justify-between text-sm">
                  <span>Change:</span>
                  <span>${changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isLoading ? "Processing..." : "Complete Payment"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false)
          onClose()
        }}
        saleData={saleData}
      />
    </>
  )
}
