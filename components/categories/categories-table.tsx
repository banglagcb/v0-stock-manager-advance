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

interface Category {
  id: string
  name: string
  description: string
  created_at: string
}

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories: initialCategories }: CategoriesTableProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (categoryId: string) => {
    setDeletingId(categoryId)
    const supabase = createClient()

    try {
      const { data: products } = await supabase.from("products").select("id").eq("category_id", categoryId).limit(1)

      if (products && products.length > 0) {
        alert("Cannot delete category that has products assigned to it. Please reassign or delete the products first.")
        return
      }

      const { error } = await supabase.from("categories").delete().eq("id", categoryId)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== categoryId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Categories</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search categories..."
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "No description"}</TableCell>
                  <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/categories/${category.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteConfirmationDialog
                        title="Delete Category"
                        description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
                        onConfirm={() => handleDelete(category.id)}
                        isLoading={deletingId === category.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">No categories found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  )
}
