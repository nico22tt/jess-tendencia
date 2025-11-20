"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, Footprints, Shirt, Gem, Menu, X } from "lucide-react"
import { cn } from "../lib/utils"


interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  subcategories?: string[]
}

const menuItems: MenuItem[] = [
  {
    id: "calzado",
    label: "Calzado",
    icon: <Footprints className="h-5 w-5" />,
    subcategories: ["Zapatillas", "Botas", "Botines"],
  },
  {
    id: "jeans",
    label: "Jeans",
    icon: <Shirt className="h-5 w-5" />,
  },
  {
    id: "accesorios",
    label: "Accesorios",
    icon: <Gem className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["calzado"])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-pink-100 shadow-lg lg:hidden hover:bg-white hover:shadow-xl transition-all duration-200 px-3 mx-1 my-7"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-md border-r border-pink-100 z-40 pt-20 transition-all duration-300 ease-out shadow-xl lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 mt-20">
          <nav className="space-y-0 py-0">
            {menuItems.map((item) => (
              <div key={item.id} className="space-y-2 py-0 my-20 mb-0 mt-0 pt-0">
                <button
                  onClick={() => item.subcategories && toggleExpanded(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 rounded-xl text-left transition-all duration-200 py-2",
                    "hover:bg-pink-50 hover:shadow-sm hover:scale-[1.02]",
                    "text-gray-700 font-medium group",
                    expandedItems.includes(item.id) && item.subcategories && "bg-pink-50 shadow-sm",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-pink-400 group-hover:text-pink-500 transition-colors duration-200">
                      {item.icon}
                    </div>
                    <span className="group-hover:text-gray-900 transition-colors duration-200">{item.label}</span>
                  </div>
                  {item.subcategories &&
                    (expandedItems.includes(item.id) ? (
                      <ChevronDown className="h-4 w-4 text-pink-400 transition-all duration-300 ease-out" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-pink-400 transition-all duration-300 ease-out" />
                    ))}
                </button>

                {item.subcategories && (
                  <div
                    className={cn(
                      "ml-8 space-y-1 overflow-hidden transition-all duration-400 ease-out",
                      expandedItems.includes(item.id)
                        ? "max-h-48 opacity-100 transform translate-y-0"
                        : "max-h-0 opacity-0 transform -translate-y-2",
                    )}
                  >
                    {item.subcategories.map((subcategory, index) => (
                      <button
                        key={subcategory}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-pink-25 hover:shadow-sm transition-all duration-200 hover:translate-x-1"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          transitionDelay: expandedItems.includes(item.id) ? `${index * 50}ms` : "0ms",
                        }}
                      >
                        {subcategory}
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
