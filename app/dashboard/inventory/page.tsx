import { createClient } from "@/lib/supabase/server"
import { InventoryTable } from "@/components/inventory/inventory-table"

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("stock_quantity", { ascending: true })

  if (error) {
    console.error("Error fetching inventory:", error)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Monitor and adjust stock levels</p>
      </div>

      <InventoryTable products={products || []} />
    </div>
  )
}
