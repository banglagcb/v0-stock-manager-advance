import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesChart } from "@/components/analytics/sales-chart"
import { TopProductsChart } from "@/components/analytics/top-products-chart"
import { InventoryStatusChart } from "@/components/analytics/inventory-status-chart"
import { RecentActivity } from "@/components/analytics/recent-activity"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get dashboard statistics
  const [
    { count: totalProducts },
    { count: lowStockProducts },
    { count: totalCategories },
    { count: totalSuppliers },
    { data: salesData },
    { data: recentSales },
    { data: topProducts },
    { data: inventoryStatus },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).lt("stock_quantity", 10),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("suppliers").select("*", { count: "exact", head: true }),
    // Sales data for the last 30 days
    supabase
      .from("sales")
      .select("total_amount, created_at")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at"),
    // Recent sales
    supabase
      .from("sales")
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    // Top selling products
    supabase.rpc("get_top_selling_products", { limit_count: 5 }),
    // Inventory status distribution
    supabase
      .from("products")
      .select("stock_quantity, min_stock_level, name"),
  ])

  // Calculate analytics
  const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
  const totalSales = salesData?.length || 0
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

  // Process inventory status
  const inventoryStats = inventoryStatus?.reduce(
    (acc, product) => {
      if (product.stock_quantity === 0) {
        acc.outOfStock++
      } else if (product.stock_quantity <= product.min_stock_level) {
        acc.lowStock++
      } else {
        acc.inStock++
      }
      return acc
    },
    { inStock: 0, lowStock: 0, outOfStock: 0 },
  ) || { inStock: 0, lowStock: 0, outOfStock: 0 }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      description: "Last 30 days",
      change: "+12.5%",
      changeType: "positive",
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
    },
    {
      title: "Total Sales",
      value: totalSales.toString(),
      description: "Transactions this month",
      change: "+8.2%",
      changeType: "positive",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: "Average Sale",
      value: `$${averageSaleValue.toFixed(2)}`,
      description: "Per transaction",
      change: "+4.1%",
      changeType: "positive",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts || 0,
      description: "Need attention",
      change: lowStockProducts > 5 ? "High" : "Normal",
      changeType: lowStockProducts > 5 ? "negative" : "neutral",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor your business performance and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500">{stat.description}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    stat.changeType === "positive"
                      ? "bg-green-100 text-green-800"
                      : stat.changeType === "negative"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart salesData={salesData || []} />
        <TopProductsChart topProducts={topProducts || []} />
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryStatusChart inventoryStats={inventoryStats} />
        <RecentActivity recentSales={recentSales || []} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="font-semibold">{totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Categories</span>
              <span className="font-semibold">{totalCategories || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Suppliers</span>
              <span className="font-semibold">{totalSuppliers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Low Stock</span>
              <span className="font-semibold text-red-600">{lowStockProducts || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Sales</span>
              <span className="font-semibold">
                {recentSales?.filter((sale) => {
                  const today = new Date().toDateString()
                  return new Date(sale.created_at).toDateString() === today
                }).length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="font-semibold">
                {recentSales?.filter((sale) => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return new Date(sale.created_at) >= weekAgo
                }).length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold">{totalSales}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Revenue</span>
              <span className="font-semibold text-green-600">${totalRevenue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/dashboard/products/new"
              className="flex items-center space-x-3 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Add Product</span>
            </a>
            <a
              href="/dashboard/pos"
              className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Open POS</span>
            </a>
            <a
              href="/dashboard/inventory"
              className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Check Inventory</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
