import { createClient } from "@/lib/supabase/server"
import { CategoryForm } from "@/components/categories/category-form"
import { notFound, redirect } from "next/navigation"

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  if (!isValidUUID(params.id)) {
    console.log("[v0] Invalid UUID format:", params.id)
    if (params.id === "new") {
      redirect("/dashboard/categories/new")
    }
    notFound()
  }

  const supabase = await createClient()

  console.log("[v0] Attempting to fetch category with ID:", params.id)

  const { data: category, error } = await supabase.from("categories").select("*").eq("id", params.id).single()

  console.log("[v0] Category query result:", { category, error })

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - category doesn't exist
      console.log("[v0] Category not found, calling notFound()")
      notFound()
    } else {
      // Other database error - show error message instead of 404
      console.error("[v0] Database error:", error)
      return (
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-red-600">Failed to load category: {error.message}</p>
          </div>
        </div>
      )
    }
  }

  if (!category) {
    console.log("[v0] No category data, calling notFound()")
    notFound()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Category</h1>
        <p className="text-gray-600">Update category information</p>
      </div>

      <CategoryForm category={category} isEditing={true} />
    </div>
  )
}
