"use client"

import type React from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // La protección real se hace en el middleware con Supabase
  return <>{children}</>
}
