import { createClient } from "@/lib/supabase/server"
import { PurchasesTable } from "@/components/purchases/purchases-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PurchasesPage() {
  const supabase = await createClient()

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select(`
      *,
      suppliers (
        name
      ),
      profiles!purchases_user_id_fkey (
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching purchases:", error)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
          <p className="text-gray-600">Manage supplier orders and inventory receiving</p>
        </div>
        <Link href="/dashboard/purchases/new">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Purchase Order
          </Button>
        </Link>
      </div>

      <PurchasesTable purchases={purchases || []} />
    </div>
  )
}
