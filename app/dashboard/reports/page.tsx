import { createClient } from "@/lib/supabase/server"
import { ReportsInterface } from "@/components/reports/reports-interface"

export default async function ReportsPage() {
  const supabase = await createClient()

  // Get data for reports
  const [{ data: salesData }, { data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("sales")
      .select(`
        *,
        sale_items (
          *,
          products (
            name,
            categories (
              name
            )
          )
        ),
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false }),
    supabase.from("products").select(`
        *,
        categories (
          name
        ),
        suppliers (
          name
        )
      `),
    supabase.from("categories").select("*"),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate detailed reports and export data</p>
      </div>

      <ReportsInterface
        salesData={salesData || []}
        productsData={productsData || []}
        categoriesData={categoriesData || []}
      />
    </div>
  )
}
