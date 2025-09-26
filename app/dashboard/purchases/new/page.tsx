import { createClient } from "@/lib/supabase/server"
import { PurchaseOrderForm } from "@/components/purchases/purchase-order-form"

export default async function NewPurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ supplier?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get suppliers and products
  const [{ data: suppliers }, { data: products }] = await Promise.all([
    supabase.from("suppliers").select("*").order("name"),
    supabase
      .from("products")
      .select(`
        *,
        categories (
          name
        ),
        suppliers (
          name
        )
      `)
      .eq("status", "active")
      .order("name"),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Purchase Order</h1>
        <p className="text-gray-600">Order products from suppliers</p>
      </div>

      <PurchaseOrderForm
        suppliers={suppliers || []}
        products={products || []}
        preselectedSupplierId={params.supplier}
      />
    </div>
  )
}
