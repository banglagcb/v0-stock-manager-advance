import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:hidden">
        <MobileNav />
      </div>

      <main className="flex-1 overflow-auto px-4 py-4 lg:px-6 lg:py-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
