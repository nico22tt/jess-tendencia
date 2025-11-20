"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "client"
}

interface AuthContextType {
  user: User | null
  userId: string | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("jess-tendencia-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Mock login - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let mockUser: User

    if (email === "admin@test.com" && password === "password123") {
      mockUser = {
        id: "1",
        name: "Administrador",
        email,
        role: "admin",
      }
    } else if (email === "client@test.com" && password === "password123") {
      mockUser = {
        id: "2",
        name: "Cliente",
        email,
        role: "client",
      }
    } else {
      // Default user for any other credentials
      mockUser = {
        id: "3",
        name: email === "valentina@example.com" ? "Valentina" : "Usuario",
        email,
        role: "client",
      }
    }

    setUser(mockUser)
    localStorage.setItem("jess-tendencia-user", JSON.stringify(mockUser))
    setIsLoading(false)

    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get("redirect")

    if (redirectTo) {
      router.push(redirectTo)
    } else if (mockUser.role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("jess-tendencia-user")
    router.push("/")
  }

  const value = {
    user,
    userId: user?.id || null,
    isLoggedIn: !!user,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
