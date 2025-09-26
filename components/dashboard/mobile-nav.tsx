"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "📊",
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: "📦",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: "🏷️",
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: "📋",
  },
  {
    name: "POS",
    href: "/dashboard/pos",
    icon: "💳",
  },
  {
    name: "Sales",
    href: "/dashboard/sales",
    icon: "📈",
  },
  {
    name: "Suppliers",
    href: "/dashboard/suppliers",
    icon: "🏭",
  },
  {
    name: "Purchases",
    href: "/dashboard/purchases",
    icon: "🛒",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: "📊",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "⚙️",
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b lg:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">SM</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Stock Manager</h1>
          </div>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">SM</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">Stock Manager</h1>
                      <p className="text-xs text-gray-500">Advanced</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <span className="mr-2">🚪</span>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
