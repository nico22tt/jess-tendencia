"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"
import { ReactNode } from "react"

type Props = {
  user: any
  children?: ReactNode
}

export function AdminDashboardClient({ user }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar - maneja su propio estado mobile */}
      <AdminSidebar />

      {/* Contenido principal */}
      <div className="flex-1 lg:ml-72 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <AdminHeader user={user} />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Fila superior: 2 charts grandes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <RevenueChart />
              <VisitorsChart />
            </div>

            {/* Fila inferior: 3 cards que ocupan TODO el ancho */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <LatestTransactions />
              <PopularProducts />
              <BrowserUsageChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
