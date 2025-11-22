"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import type { User as SupabaseUser } from "@supabase/supabase-js"

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
  register: (email: string, password: string, name: string) => Promise<void>  // ← ESTA LÍNEA
  logout: () => Promise<void>
  isLoading: boolean
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user session on mount
  useEffect(() => {
    checkUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {

      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Obtener perfil del usuario desde la tabla users
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
        return
      }

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
        email: supabaseUser.email!,
        avatar: profile?.avatar_url,
        role: profile?.role || 'client',
      }

      setUser(userData)
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // 2. Crear perfil en tabla users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: name,
            role: 'client', // Por defecto todos son clientes
          })

        if (profileError) {
          console.error("Error creating profile:", profileError)
        }

        // Redirigir a login
        router.push('/login?registered=true')
      }
    } catch (error: any) {
      console.error("Error registering:", error)
      throw new Error(error.message || "Error al registrar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
  console.log("LOGIN CALLED", email)
  setIsLoading(true)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Espera breve para asegurar que la sesión se setea
      await new Promise(resolve => setTimeout(resolve, 750))
      await loadUserProfile(data.user)
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = profile?.role || 'client'
      const isAdminApp = typeof window !== 'undefined' && window.location.port === '3001'
      console.log("Redirigiendo: role:", role, "isAdminApp:", isAdminApp)
      if (role === 'admin') {
        if (isAdminApp) {
          console.log('En admin, push /dashboard')
          router.push('/dashboard')
        } else {
          console.log('En web, redirigir a http://localhost:3001/dashboard')
          window.location.replace('http://localhost:3001/dashboard')
        }
      } else {
        console.log('Cliente, ir a /')
        router.push('/')
      }
    }
  } catch (error: any) {
    console.error("Error logging in:", error)
    throw new Error(error.message || "Error al iniciar sesión")
  } finally {
    setIsLoading(false)
  }
}



  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const value = {
    user,
    userId: user?.id || null,
    isLoggedIn: !!user,
    login,
    register,
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
