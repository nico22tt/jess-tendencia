"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { CashFlowSummary } from "@/components/cash-flow-summary"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { CashFlowTable } from "@/components/cash-flow-table"
import { Loader2, DollarSign } from "lucide-react"

export default function CashFlowPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }

    setUser(user)
    setLoading(false)
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
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-600/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flujo de Caja</h1>
            <p className="text-muted-foreground mt-1">
              Control completo de ingresos, gastos y balance financiero
            </p>
          </div>
        </div>

        {/* Resumen - 3 cards */}
        <CashFlowSummary />

        {/* Gráfico */}
        <CashFlowChart />

        {/* Tabla de movimientos */}
        <CashFlowTable />
      </div>
    </AdminDashboardLayout>
  )
}
