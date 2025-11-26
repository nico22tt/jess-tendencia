'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Alert, AlertDescription } from "@jess/ui/alert"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Agrega aquí los dominios que sí quieres permitir
const allowedDomains = [
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
  "icloud.com", "live.com", "msn.com", "protonmail.com", "aol.com"
]

function isAllowedDomain(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() || ""
  return allowedDomains.includes(domain)
}

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido"
    } else if (!isAllowedDomain(formData.email)) {
      newErrors.email = "Solo se permiten emails populares (Gmail, Hotmail, Outlook, etc.)"
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })
    setIsLoading(false)
    if (error) {
      setErrors({
        general:
          error.status === 400 || error.status === 403
            ? "Credenciales inválidas o usuario no encontrado"
            : error.message || "Error al iniciar sesión. Verifica tus credenciales.",
      })
      return
    }
    const role = data.user?.user_metadata?.role || "client"
    if (role === "admin") {
      window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001/dashboard"
    } else {
      router.replace("/mi-cuenta")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-25 via-white to-pink-50 mt-40">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 mt-10 mb-20">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Iniciar Sesión en la Tienda
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ingresa a tu cuenta de Jess Tendencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        {errors.email}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        {errors.password}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
              <div className="text-center space-y-4">
                <Link href="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
                <div className="text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <Link href="/register" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
                    Crear cuenta
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
