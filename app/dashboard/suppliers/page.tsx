import { createClient } from "@/lib/supabase/server"
import { SuppliersTable } from "@/components/suppliers/suppliers-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuppliersPage() {
  const supabase = await createClient()

  const { data: suppliers, error } = await supabase.from("suppliers").select("*").order("name")

  if (error) {
    console.error("Error fetching suppliers:", error)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suppliers</h1>
          <p className="text-gray-600">Manage your supplier relationships and contacts</p>
        </div>
        <Link href="/dashboard/suppliers/new">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Supplier
          </Button>
        </Link>
      </div>

      <SuppliersTable suppliers={suppliers || []} />
    </div>
  )
}
