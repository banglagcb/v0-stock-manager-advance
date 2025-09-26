import { ProductForm } from "@/components/products/product-form"

export default function NewProductPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
        <p className="text-gray-600">Create a new product in your inventory</p>
      </div>

      <ProductForm />
    </div>
  )
}
