import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"


export default function Loading() {
  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-20 bg-zinc-900 rounded-lg animate-pulse" />
            <div className="h-96 bg-zinc-900 rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  )
}
