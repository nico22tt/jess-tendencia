"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Sun, Moon, Menu } from "lucide-react"  // 👈 Agrega Menu
import { Button } from "@jess/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@jess/ui/dropdown-menu"
import { createClient } from "@utils/supabase/client"

type AdminHeaderProps = {
  user?: any
  profile?: any
  onMenuClick?: () => void  // 👈 Agrega esta línea
}

export function AdminHeader({ user, profile, onMenuClick }: AdminHeaderProps) {  // 👈 Agrega la prop
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const initial = savedTheme ?? "dark"
    setTheme(initial)
    applyTheme(initial)
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement
    if (newTheme === "light") {
      root.classList.add("light")
    } else {
      root.classList.remove("light")
    }
  }

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    applyTheme(next)
  }

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
    await supabase.auth.signOut()
    router.replace("/login")
  }

  if (!mounted) return null

  return (
    <div className="flex items-center justify-between px-6 py-4 pt-3">
      <div className="flex items-center gap-3">
        {/* Botón de menú mobile */}
        {onMenuClick && (  // 👈 Solo muestra si hay onMenuClick
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Admin
          </h2>
          {user && (
            <p className="text-sm text-muted-foreground">
              {user.email}{" "}
              {profile?.role && (
                <span className="text-primary">({profile.role})</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 pr-1 sm:pr-4">
        {/* Toggle de tema */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notificaciones */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => router.push("/dashboard/notifications")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border border-border"
          >
            <DropdownMenuLabel className="text-foreground">
              Cuenta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-muted-foreground focus:bg-muted focus:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
