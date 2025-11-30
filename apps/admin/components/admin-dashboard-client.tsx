"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { TodoList } from "@/components/todo-list"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"

type Props = {
  user: any
}

export function AdminDashboardClient({ user }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Sidebar desktop fija */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 lg:w-72 z-40 border-r border-border bg-card py-1">
        <AdminSidebar />
      </div>

      {/* Sidebar mobile como drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* overlay translúcido con blur */}
          <div
            className="flex-1 bg-background/40 backdrop-blur-md transition-opacity duration-100"
            onClick={toggleSidebar}
          />
          <div className="w-64 max-w-[0%] bg-card border-r border-border shadow-2xl">
            <AdminSidebar onClose={toggleSidebar} />
          </div>
        </div>
      )}


      {/* Botón menú mobile */}
      {!sidebarOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-2xl"
          onClick={toggleSidebar}
        >
          ☰
        </button>
      )}

      {/* Contenido principal */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header sticky que ocupa todo el ancho */}
        <header className="sticky top-0 z-30 bg-card border-b border-border pl-12 ml-2">
          <AdminHeader user={user} />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden lg:ml-20">
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
