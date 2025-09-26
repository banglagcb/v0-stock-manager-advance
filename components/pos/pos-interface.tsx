"use client"

import type React from "react"

import { useState } from "react"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { PaymentModal } from "./payment-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  sku: string
  selling_price: number
  stock_quantity: number
  unit: string
  barcode?: string
  categories?: { name: string }
}

interface CartItem extends Product {
  quantity: number
  total: number
}

interface POSInterfaceProps {
  products: Product[]
}

export function POSInterface({ products }: POSInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.categories?.name).filter(Boolean)))

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categories?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle barcode scanning
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const product = products.find((p) => p.barcode === barcodeInput.trim() || p.sku === barcodeInput.trim())
    if (product) {
      addToCart(product)
      setBarcodeInput("")
    } else {
      alert("Product not found!")
    }
  }

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          alert("Not enough stock available!")
          return prevCart
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.selling_price,
              }
            : item,
        )
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            total: product.selling_price,
          },
        ]
      }
    })
  }

  // Update cart item quantity
  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && newQuantity > product.stock_quantity) {
      alert("Not enough stock available!")
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.selling_price,
            }
          : item,
      ),
    )
  }

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const taxRate = 0.1 // 10% tax
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Products */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Point of Sale</h1>

          {/* Search and Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <Input
                placeholder="Scan barcode or enter SKU..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
              <Button type="submit" variant="outline">
                Add
              </Button>
            </form>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white shadow-lg">
        <Cart
          items={cart}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={() => setIsPaymentModalOpen(true)}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cartItems={cart}
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
        onPaymentComplete={clearCart}
      />
    </div>
  )
}
