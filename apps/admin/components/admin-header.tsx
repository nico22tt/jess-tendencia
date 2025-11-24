"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@jess/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@jess/ui/dropdown-menu"

type AdminHeaderProps = {
  user?: any
  profile?: any
}

export function AdminHeader({ user, profile }: AdminHeaderProps) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications?unreadOnly=true")
      const data = await res.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const handleLogout = async () => {
    // Si tienes funcionalidad logout implementada, aquí llamas al método correspondiente (supabase o api)
    router.push("/")
  }

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Admin</h2>
          {/* Datos del usuario (opcional) */}
          {user && (
            <p className="text-sm text-zinc-400">
              {user.email} {profile?.role ? <span className="text-pink-500">({profile.role})</span> : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Botón de Notificaciones */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => router.push("/dashboard/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
          {/* Menú de Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
              <DropdownMenuLabel className="text-white">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
