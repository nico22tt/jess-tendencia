"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Inbox, Calendar, Search, Settings, Package, Plus, Users, CreditCard, ShoppingCart } from "lucide-react"
import { cn } from "@jess/ui/utils"
const navigationSections = [
  {
    title: "Application",
    items: [
      { name: "Home", icon: Home, href: "/dashboard" },
      { name: "Inbox", icon: Inbox, href: "/dashboard/inbox" },
      { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
      { name: "Search", icon: Search, href: "/dashboard/search" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },
  {
    title: "Products",
    items: [
      { name: "See All Products", icon: Package, href: "/dashboard/products" },
      { name: "Add Product", icon: Plus, href: "/dashboard/products/add" },
      { name: "Add Category", icon: Plus, href: "/dashboard/categories/add" },
    ],
  },
  {
    title: "Users",
    items: [
      { name: "See All Users", icon: Users, href: "/dashboard/users" }
    ],
  },
  {
    title: "Orders/Payments",
    items: [
      { name: "See All Transactions", icon: CreditCard, href: "/dashboard/transactions" },
      { name: "Add Order", icon: ShoppingCart, href: "/dashboard/orders/add" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white">Lama Dev</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">{section.title}</h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
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
