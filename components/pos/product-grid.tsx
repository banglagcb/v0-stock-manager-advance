"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  sku: string
  selling_price: number
  stock_quantity: number
  unit: string
  categories?: { name: string }
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <p className="text-gray-500">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
              {product.categories && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {product.categories.name}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-amber-600">${product.selling_price.toFixed(2)}</div>
              <div className="text-sm text-gray-500">
                {product.stock_quantity} {product.unit}
              </div>
            </div>

            <Button
              onClick={() => onAddToCart(product)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              size="sm"
            >
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
