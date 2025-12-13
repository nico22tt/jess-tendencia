"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"
import { Loader2 } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.role !== "admin") {
        router.push("/login")
        return
      }
      setUser(user)
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Primera fila - 2 Gráficos grandes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RevenueChart />
          <VisitorsChart />
        </div>

        {/* Segunda fila - 3 Cards que ocupan TODO el ancho */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LatestTransactions />
          <PopularProducts />
          <BrowserUsageChart />
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
