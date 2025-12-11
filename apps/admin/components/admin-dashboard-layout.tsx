"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { ReactNode } from "react"

type Props = {
  user: any
  children: ReactNode
}

export function AdminDashboardLayout({ user, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Contenido principal con margen izquierdo */}
      <div className="flex-1 lg:ml-72 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <AdminHeader user={user} />
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
