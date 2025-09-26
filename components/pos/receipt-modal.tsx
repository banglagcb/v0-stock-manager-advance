"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  saleData: any
}

export function ReceiptModal({ isOpen, onClose, saleData }: ReceiptModalProps) {
  if (!saleData) return null

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 20px; }
                .center { text-align: center; }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .separator { border-top: 1px dashed #000; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 2px 0; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        <div id="receipt-content" className="space-y-4 font-mono text-sm">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="font-bold text-lg">Stock Manager Advanced</div>
            <div className="text-xs text-gray-600">Point of Sale System</div>
            <div className="text-xs text-gray-600">{new Date(saleData.created_at).toLocaleString()}</div>
          </div>

          <Separator />

          {/* Sale Info */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Sale #:</span>
              <span>{saleData.sale_number}</span>
            </div>
            {saleData.customer_name && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{saleData.customer_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize">{saleData.payment_method}</span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            {saleData.items.map((item: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="font-medium">{item.name}</div>
                <div className="flex justify-between text-xs">
                  <span>
                    {item.quantity} x ${item.selling_price.toFixed(2)}
                  </span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${saleData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${saleData.tax_amount.toFixed(2)}</span>
            </div>
            {saleData.discount_amount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${saleData.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total:</span>
              <span>${saleData.total_amount.toFixed(2)}</span>
            </div>
            {saleData.payment_method === "cash" && (
              <>
                <div className="flex justify-between">
                  <span>Received:</span>
                  <span>${saleData.amount_received.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>${saleData.change_amount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="text-center text-xs text-gray-600">
            <div>Thank you for your business!</div>
            <div>Please keep this receipt for your records</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handlePrint} className="flex-1 bg-transparent" variant="outline">
            Print Receipt
          </Button>
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
