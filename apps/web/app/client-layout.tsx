"use client"


import type React from "react"
import { MainLayout } from "@/components/main-layout"
import { usePathname } from "next/navigation"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Rutas que NO deben tener MainLayout (Header/Footer)
  const excludedRoutes = ["/login", "/register", "/admin"]
  const shouldExcludeLayout = excludedRoutes.some((route) =>
    pathname?.startsWith(route)
  )

  return shouldExcludeLayout ? (
    <>{children}</>
  ) : (
    <MainLayout>{children}</MainLayout>
  )
}
