import { redirect } from "next/navigation"
import { createServerClient } from "@utils/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RevenueChart } from "@/components/revenue-chart"
import { LatestTransactions } from "@/components/latest-transactions"
import { BrowserUsageChart } from "@/components/browser-usage-chart"
import { TodoList } from "@/components/todo-list"
import { VisitorsChart } from "@/components/visitors-chart"
import { PopularProducts } from "@/components/popular-products"

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario autenticado, redirige al login admin
  if (!user) {
    redirect("/login")
  }

  // Verifica el rol directamente desde user_metadata
  const role = user.user_metadata?.role
  if (role !== "admin") {
    redirect("/login")
  }

return (
  <div className=" bg-zinc-950">
    <AdminSidebar className="fixed left-0 top-0 h-screen z-20" />
    <div className="ml-64 flex-1 flex flex-col">
      <AdminHeader user={user} />
      <main className="flex-1 p-6 ">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Top row: two main charts, equal size */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-6">
              <RevenueChart />
            </div>
            <div className="col-span-6">
              <VisitorsChart />
            </div>
          </div>

          {/* Bottom row: horizontal cards */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <LatestTransactions />
            </div>
            <div className="col-span-3">
              <PopularProducts />
            </div>
            <div className="col-span-3">
              <BrowserUsageChart />
            </div>
            <div className="col-span-3">
              <TodoList />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
)

}
