import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Supplier</h1>
        <p className="text-gray-600">Create a new supplier profile</p>
      </div>

      <SupplierForm />
    </div>
  )
}
