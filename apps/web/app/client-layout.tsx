"use client"

import type React from "react"
import { AuthProvider } from "@jess/shared/contexts/auth"
import { CartProvider } from "@jess/shared/contexts/cart"
import { MainLayout } from "@/components/main-layout"

import { usePathname } from "next/navigation"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Routes that should NOT have the MainLayout (Header/Footer)
  const excludedRoutes = ["/login", "/register", "/admin"]
  const shouldExcludeLayout = excludedRoutes.some((route) => pathname?.startsWith(route))

  return (
    <AuthProvider>
      <CartProvider>
        {/* Conditionally apply MainLayout based on route */}
        {shouldExcludeLayout ? children : <MainLayout>{children}</MainLayout>}
      </CartProvider>
    </AuthProvider>
  )
}
