"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Inbox,
  Search,
  Settings,
  Package,
  Plus,
  Users,
  CreditCard,
  ShoppingCart,
  X,
} from "lucide-react"
import { cn } from "@jess/ui/utils"

const navigationSections = [
  {
    title: "Application",
    items: [
      { name: "Home", icon: Home, href: "/dashboard" },
      { name: "Notificaciones", icon: Inbox, href: "/dashboard/notifications" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },
  {
    title: "Products",
    items: [
      { name: "Gestionar Inventario", icon: Package, href: "/dashboard/inventory" },
      { name: "Ver todos los Productos", icon: Package, href: "/dashboard/products" },
      { name: "Crear nuevo Producto", icon: Plus, href: "/dashboard/products/add" },
      { name: "Crear nueva Categoria", icon: Plus, href: "/dashboard/categories/add" },
    ],
  },
  {
    title: "Users",
    items: [
      { name: "Ver todos los Usuarios", icon: Users, href: "/dashboard/users" },
    ],
  },
  {
    title: "Orders/Payments",
    items: [
      { name: "Ver Transacciones", icon: CreditCard, href: "/dashboard/transactions" },
      { name: "Crear Orden de Compra", icon: ShoppingCart, href: "/dashboard/orders/add" },
    ],
  },
]

type Props = {
  className?: string
  onClose?: () => void
}

export function AdminSidebar({ className, onClose }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "w-64 lg:w-72 xl:w-80",
        "fixed lg:relative left-0 top-0 h-screen z-50 lg:z-auto",
        "bg-card text-foreground border-r border-border flex flex-col shadow-2xl lg:shadow-none",
        className,
      )}
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold">Dashboard</h1>
        <button
          title="Cerrar menú"
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-muted text-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm",
                      )}
                    >
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
