"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, Footprints, Shirt, Gem, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "../lib/utils"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  subcategories?: { name: string; href: string }[]
}

const menuItems: MenuItem[] = [
  {
    id: "calzado",
    label: "Calzado",
    icon: <Footprints className="h-5 w-5" />,
    subcategories: [
      { name: "Zapatillas", href: "/zapatillas" },
      { name: "Botas", href: "/botas" },
      { name: "Botines", href: "/botines" },
      { name: "Pantuflas", href: "/pantuflas" }
    ],
  },
  {
    id: "jeans",
    label: "Jeans",
    icon: <Shirt className="h-5 w-5" />,
    href: "/jeans",
  },
  {
    id: "accesorios",
    label: "Accesorios",
    icon: <Gem className="h-5 w-5" />,
    href: "/accesorios",
  },
]

export function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["calzado"])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    )
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Botón hamburguesa - SOLO mobile y solo cuando el menú está cerrado */}
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-[60] p-3 rounded-xl bg-white/95 backdrop-blur-sm border border-pink-100 shadow-xl lg:hidden hover:bg-white hover:shadow-2xl transition-all duration-200"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Overlay - SOLO mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-md border-r border-pink-100 pt-20 transition-transform duration-300 ease-out shadow-2xl",
          "z-[50] lg:z-auto",
          "lg:relative lg:translate-x-0 lg:shadow-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Botón cerrar solo mobile, dentro del sidebar */}
        <button
          onClick={toggleMobileMenu}
          className="absolute top-5 right-5 lg:hidden p-2 rounded-full bg-white/80 hover:bg-white shadow-md border border-pink-100 transition-all"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>

        <div className="p-6 h-full">
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="space-y-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "hover:bg-pink-50 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                      "text-gray-700 font-medium group cursor-pointer",
                    )}
                  >
                    <div className="text-pink-400 group-hover:text-pink-500 transition-colors duration-200 flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="group-hover:text-gray-900 transition-colors duration-200">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={() => item.subcategories && toggleExpanded(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200",
                      "hover:bg-pink-50 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                      "text-gray-700 font-medium group cursor-pointer",
                      expandedItems.includes(item.id) && item.subcategories && "bg-pink-50 shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-pink-400 group-hover:text-pink-500 transition-colors duration-200 flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="group-hover:text-gray-900 transition-colors duration-200">
                        {item.label}
                      </span>
                    </div>
                    {item.subcategories &&
                      (expandedItems.includes(item.id) ? (
                        <ChevronDown className="h-4 w-4 text-pink-400 transition-all duration-300 ease-out flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-pink-400 transition-all duration-300 ease-out flex-shrink-0" />
                      ))}
                  </button>
                )}

                {item.subcategories && (
                  <div
                    className={cn(
                      "ml-8 space-y-1 overflow-hidden transition-all duration-400 ease-out",
                      expandedItems.includes(item.id)
                        ? "max-h-48 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-2",
                    )}
                  >
                    {item.subcategories.map((subcategory, index) => (
                      <button
                        key={subcategory.name}
                        onClick={() => handleNavigation(subcategory.href)}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-pink-25 hover:shadow-sm transition-all duration-200 hover:translate-x-1 block"
                        style={{
                          transitionDelay: expandedItems.includes(item.id)
                            ? `${index * 50}ms`
                            : "0ms",
                        }}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
