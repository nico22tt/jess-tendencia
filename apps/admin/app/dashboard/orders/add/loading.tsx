import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"


export default function AddOrderLoading() {
  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-20 bg-zinc-800 rounded-lg" />
              <div className="h-96 bg-zinc-800 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
