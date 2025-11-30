"use client"

import { useState, useEffect } from "react"
import { Search, Heart, ChevronDown, User, LogOut, UserCircle, Package, ShoppingCart } from "lucide-react"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { cn } from "@jess/shared/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@utils/supabase/client"
import { useRouter } from "next/navigation"

interface MenuItem {
  id: string
  label: string
  href?: string
  subcategories?: { name: string; href: string }[]
}

const menuItems: MenuItem[] = [
  {
    id: "calzado",
    label: "Calzado",
    subcategories: [
      { name: "Zapatillas", href: "/zapatillas" },
      { name: "Botas", href: "/botas" },
      { name: "Botines", href: "/botines" },
      { name: "Pantuflas", href: "/pantuflas" },
    ],
  },
  {
    id: "jeans",
    label: "Jeans",
    href: "/jeans",
  },
  {
    id: "accesorios",
    label: "Accesorios",
    href: "/accesorios",
  },
]

export function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [totalItems, setTotalItems] = useState<number>(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUserAndCart() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setTotalItems(0)
        return
      }

      const res = await fetch(`/api/cart?userId=${user.id}`)
      const data = await res.json()
      const items = Array.isArray(data) ? data : []

      const count = items.reduce(
        (sum: number, i: any) => sum + (i.quantity || 1),
        0
      )
      setTotalItems(count)
    }

    loadUserAndCart()
  }, [supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  const handleMouseEnter = (itemId: string) => {
    setActiveDropdown(itemId)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/jess-tendencia-logo.png"
                alt="Jess Tendencia"
                width={120}
                height={60}
                className="object-contain pl-[5px] ml-8"
              />
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
                      activeDropdown === item.id && "text-pink-600 bg-pink-50",
                    )}
                  >
                    {item.label}
                    {item.subcategories && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          activeDropdown === item.id && "rotate-180",
                        )}
                      />
                    )}
                  </button>
                )}
                {item.subcategories && (
                  <div
                    className={cn(
                      "absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-pink-100 overflow-hidden transition-all duration-200 ease-out",
                      activeDropdown === item.id
                        ? "opacity-100 transform translate-y-0 visible"
                        : "opacity-0 transform -translate-y-2 invisible",
                    )}
                  >
                    {item.subcategories.map((subcategory, index) => (
                      <Link
                        key={subcategory.name}
                        href={subcategory.href}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-25 transition-all duration-150"
                        style={{
                          transitionDelay: activeDropdown === item.id ? `${index * 30}ms` : "0ms",
                        }}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar productos..." className="pl-10 bg-card border-border" />
          </div>
          <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
            <Heart className="h-5 w-5" />
          </Button>
          <Link href="/carrito" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-pink-500 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white"
                  style={{
                    minWidth: "16px",
                    minHeight: "16px",
                    lineHeight: "16px",
                    padding: "0 2px",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("user")}
              onMouseLeave={handleMouseLeave}
            >
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-foreground hover:text-primary"
              >
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-pink-600" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.user_metadata?.name}
                </span>
              </Button>
              <div
                className={cn(
                  "absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-pink-100 overflow-hidden transition-all duration-200 ease-out",
                  activeDropdown === "user"
                    ? "opacity-100 transform translate-y-0 visible"
                    : "opacity-0 transform -translate-y-2 invisible",
                )}
              >
                <div className="px-4 py-3 border-b border-pink-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user.user_metadata?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  href="/mi-cuenta"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-25 transition-all duration-150"
                >
                  <UserCircle className="h-4 w-4" />
                  Mi cuenta
                </Link>
                <Link
                  href="/mis-pedidos"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-25 transition-all duration-150"
                >
                  <Package className="h-4 w-4" />
                  Mis pedidos
                </Link>
                <Link
                  href="/favoritos"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-25 transition-all duration-150"
                >
                  <Heart className="h-4 w-4" />
                  Favoritos
                </Link>
                <div className="border-t border-pink-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-25 transition-all duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
