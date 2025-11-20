"use client"

import { Bell, User } from "lucide-react"
import { Button } from "@jess/ui/button"

export function AdminHeader() {
  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
