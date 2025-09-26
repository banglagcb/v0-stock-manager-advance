import { createClient } from "@/lib/supabase/server"
import { POSInterface } from "@/components/pos/pos-interface"

export default async function POSPage() {
  const supabase = await createClient()

  // Get products for POS
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("status", "active")
    .gt("stock_quantity", 0)
    .order("name")

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="h-full">
      <POSInterface products={products || []} />
    </div>
  )
}
