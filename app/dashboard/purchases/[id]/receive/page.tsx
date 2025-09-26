import { createClient } from "@/lib/supabase/server"
import { ReceiveOrderForm } from "@/components/purchases/receive-order-form"
import { notFound } from "next/navigation"

export default async function ReceiveOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select(`
      *,
      suppliers (
        name
      ),
      purchase_items (
        *,
        products (
          name,
          sku
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !purchase) {
    notFound()
  }

  if (purchase.status !== "pending") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Already Processed</h1>
          <p className="text-gray-600">This purchase order has already been received or cancelled.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive Order</h1>
        <p className="text-gray-600">
          Receive items from purchase order {purchase.purchase_number} - {purchase.suppliers?.name}
        </p>
      </div>

      <ReceiveOrderForm purchase={purchase} />
    </div>
  )
}
