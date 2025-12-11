"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { TodoList } from "@/components/todo-list"
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

      {/* Contenido principal - AGREGADO lg:ml-72 aquí 👇 */}
      <div className="flex-1 lg:ml-72 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <AdminHeader user={user} />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Fila superior: 2 charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="w-full">
                <RevenueChart />
              </div>
              <div className="w-full">
                <VisitorsChart />
              </div>
            </div>

            {/* Fila inferior: cards (responsive) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              <div>
                <LatestTransactions />
              </div>
              <div>
                <PopularProducts />
              </div>
              <div>
                <BrowserUsageChart />
              </div>
              <div>
                <TodoList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
