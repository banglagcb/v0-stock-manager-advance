"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Supplier {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  created_at: string
}

interface SuppliersTableProps {
  suppliers: Supplier[]
}

export function SuppliersTable({ suppliers: initialSuppliers }: SuppliersTableProps) {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (supplierId: string) => {
    setDeletingId(supplierId)
    const supabase = createClient()

    try {
      const [productsResult, purchasesResult] = await Promise.all([
        supabase.from("products").select("id").eq("supplier_id", supplierId).limit(1),
        supabase.from("purchases").select("id").eq("supplier_id", supplierId).limit(1),
      ])

      if (
        (productsResult.data && productsResult.data.length > 0) ||
        (purchasesResult.data && purchasesResult.data.length > 0)
      ) {
        alert("Cannot delete supplier that has products or purchase orders. Please reassign or delete them first.")
        return
      }

      const { error } = await supabase.from("suppliers").delete().eq("id", supplierId)

      if (error) throw error

      setSuppliers(suppliers.filter((s) => s.id !== supplierId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting supplier:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Directory</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || "N/A"}</TableCell>
                  <TableCell>{supplier.email || "N/A"}</TableCell>
                  <TableCell>{supplier.phone || "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate">{supplier.address || "N/A"}</TableCell>
                  <TableCell>{new Date(supplier.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/suppliers/${supplier.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/dashboard/purchases/new?supplier=${supplier.id}`}>
                        <Button variant="outline" size="sm">
                          Order
                        </Button>
                      </Link>
                      <DeleteConfirmationDialog
                        title="Delete Supplier"
                        description={`Are you sure you want to delete "${supplier.name}"? This action cannot be undone.`}
                        onConfirm={() => handleDelete(supplier.id)}
                        isLoading={deletingId === supplier.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-8 text-gray-500">No suppliers found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  )
}
