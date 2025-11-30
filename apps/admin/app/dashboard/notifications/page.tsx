"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { ScrollArea } from "@jess/ui/scroll-area"
import {
  Bell,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Eye,
  Loader2,
  Filter,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  productId: string | null
  product: {
    id: string
    name: string
    sku: string
  } | null
  isRead: boolean
  createdAt: string
}

const notificationConfig = {
  stock_low: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  stock_critical: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  stock_out: {
    icon: Package,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  stock_adjusted: {
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  order_new: {
    icon: ShoppingCart,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  order_status: {
    icon: ShoppingCart,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterRead, setFilterRead] = useState<string>("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notifications")
      const data = await res.json()

      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      } else {
        alert("Error al cargar notificaciones")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar notificaciones")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      })

      if (res.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)

      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
        )
      )

      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)

    if (notification.productId) {
      router.push(`/dashboard/inventory/${notification.productId}/edit`)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "Hace un momento"
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType = filterType === "all" || notification.type === filterType
    const matchesRead =
      filterRead === "all" ||
      (filterRead === "unread" && !notification.isRead) ||
      (filterRead === "read" && notification.isRead)

    return matchesType && matchesRead
  })

  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.type))
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-600/10 rounded-lg relative">
                  <Bell className="h-6 w-6 text-pink-600" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Notificaciones
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {unreadCount > 0
                      ? `Tienes ${unreadCount} notificación${
                          unreadCount > 1 ? "es" : ""
                        } sin leer`
                      : "No tienes notificaciones sin leer"}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="border-border text-zinc-300 hover:bg-muted"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {notifications.length}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sin leer</p>
                    <p className="text-2xl font-bold text-pink-600">
                      {unreadCount}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-pink-600" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leídas</p>
                    <p className="text-2xl font-bold text-green-400">
                      {notifications.length - unreadCount}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value="all" className="text-foreground">
                      Todos los tipos
                    </SelectItem>
                    <SelectItem value="stock_low" className="text-foreground">
                      Stock Bajo
                    </SelectItem>
                    <SelectItem value="stock_critical" className="text-foreground">
                      Stock Crítico
                    </SelectItem>
                    <SelectItem value="stock_out" className="text-foreground">
                      Stock Agotado
                    </SelectItem>
                    <SelectItem value="stock_adjusted" className="text-foreground">
                      Inventario Ajustado
                    </SelectItem>
                    <SelectItem value="order_new" className="text-foreground">
                      Nuevo Pedido
                    </SelectItem>
                    <SelectItem value="order_status" className="text-foreground">
                      Estado de Pedido
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRead} onValueChange={setFilterRead}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value="all" className="text-foreground">
                      Todas
                    </SelectItem>
                    <SelectItem value="unread" className="text-foreground">
                      Sin leer
                    </SelectItem>
                    <SelectItem value="read" className="text-foreground">
                      Leídas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No hay notificaciones
                  </h3>
                  <p className="text-muted-foreground">
                    {filterType !== "all" || filterRead !== "all"
                      ? "Prueba cambiando los filtros"
                      : "Las notificaciones aparecerán aquí"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="divide-y divide-zinc-800">
                    {filteredNotifications.map((notification) => {
                      const config =
                        notificationConfig[
                          notification.type as keyof typeof notificationConfig
                        ] || notificationConfig.stock_adjusted
                      const Icon = config.icon

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            !notification.isRead ? "bg-muted/30" : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-4">
                            {/* Icon */}
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}
                            >
                              <Icon className={`h-6 w-6 ${config.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">
                                      {notification.title}
                                    </h3>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-pink-600 rounded-full" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  {notification.product && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-border text-muted-foreground"
                                      >
                                        {notification.product.sku}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(notification.createdAt)}
                                  </span>
                                  {notification.productId && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 text-xs text-pink-600 hover:text-pink-500 hover:bg-pink-600/10"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(
                                          `/dashboard/inventory/${notification.productId}/edit`
                                        )
                                      }}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Ver producto
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
