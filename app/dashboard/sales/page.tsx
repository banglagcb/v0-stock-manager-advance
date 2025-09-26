import { createClient } from "@/lib/supabase/server"
import { SalesTable } from "@/components/sales/sales-table"

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from("sales")
    .select(`
      *,
      profiles!sales_user_id_fkey (
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sales:", error)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales History</h1>
        <p className="text-gray-600">View and manage all sales transactions</p>
      </div>

      <SalesTable sales={sales || []} />
    </div>
  )
}
