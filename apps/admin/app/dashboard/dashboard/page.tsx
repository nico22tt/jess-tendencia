"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { TodoList } from "@/components/todo-list"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Top Row - Charts and Transactions */}
        <div className="grid grid-cols-12 gap-6">
          {/* Revenue Chart */}
          <div className="col-span-12 lg:col-span-8">
            <RevenueChart />
          </div>

          {/* Latest Transactions */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <LatestTransactions />
          </div>

          {/* Browser Usage */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <BrowserUsageChart />
          </div>
        </div>

        {/* Bottom Row - Lists and Products */}
        <div className="grid grid-cols-12 gap-6">
          {/* Todo List */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <TodoList />
          </div>

          {/* Total Visitors Chart */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <VisitorsChart />
          </div>

          {/* Popular Products */}
          <div className="col-span-12 lg:col-span-4">
            <PopularProducts />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
