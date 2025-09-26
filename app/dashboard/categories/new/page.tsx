import { CategoryForm } from "@/components/categories/category-form"

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Category</h1>
        <p className="text-gray-600">Create a new product category</p>
      </div>

      <CategoryForm />
    </div>
  )
}
