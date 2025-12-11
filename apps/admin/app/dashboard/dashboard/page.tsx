"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { TodoList } from "@/components/todo-list"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"

type Props = {
  user?: any
  profile?: any
}

export default function AdminDashboard({ user, profile }: Props) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content con margen izquierdo lg:ml-72 */}
      <div className="flex-1 lg:ml-72 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <AdminHeader user={user} profile={profile} />
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
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
        </main>
      </div>
    </div>
  )
}
