import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { TodoList } from "@/components/todo-list"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 lg:w-72 z-40 border-r border-border bg-card">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <AdminHeader />
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Top Row - Charts and Transactions */}
            <div className="grid grid-cols-12 gap-6">
              {/* Revenue Chart - 40% width */}
              <div className="col-span-12 lg:col-span-8">
                <RevenueChart />
              </div>

              {/* Latest Transactions - 25% width */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3">
                <LatestTransactions />
              </div>

              {/* Browser Usage - 25% width */}
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
