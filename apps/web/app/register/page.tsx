"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Alert, AlertDescription } from "@jess/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const allowedDomains = [
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com"
]

function isAllowedEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase()
  return allowedDomains.includes(domain)
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres"
    }
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido"
    } else if (!isAllowedEmail(formData.email)) {
      newErrors.email = "Solo se permiten emails populares (Gmail, Hotmail, Yahoo, Outlook)"
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})

    const origin = typeof window !== "undefined" ? window.location.origin : ""

    // Registro vía supabase.auth con redirect a /login tras confirmar el email
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { 
        data: { name: formData.name, role: "client" },
        emailRedirectTo: `${origin}/login`
      }
    })

    setIsLoading(false)
    if (error) {
      setErrors({ general: error.message || "Error al crear la cuenta" })
      return
    }

    // Sincroniza con la tabla pública si el registro fue exitoso
    if (data.user) {
      await fetch("/api/public-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          email: formData.email,
          name: formData.name,
          avatarUrl: data.user.user_metadata?.avatar_url || null,
          role: "client"
        })
      })
    }

    // Caso típico con confirmación de email activada: user existe pero session es null
    if (data.user && !data.session) {
      setRegistrationComplete(true)
      // Redirigir al login después de 7 segundos
      setTimeout(() => {
        router.replace("/login")
      }, 7000)
      return
    }

    // Si por configuración tuvieras sesión inmediata sin confirmación
    router.replace("/mi-cuenta")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Pantalla de confirmación exitosa
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-25 via-white to-pink-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 mt-40 mb-20">
          <div className="w-full max-w-md">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  ¡Cuenta creada exitosamente!
                </CardTitle>
                <Alert className="bg-green-50 border-green-400 text-left">
                  <AlertDescription className="text-sm text-green-800 space-y-2">
                    <p className="font-medium">
                      📧 Te enviamos un email de confirmación a:
                    </p>
                    <p className="font-semibold">{formData.email}</p>
                    <p className="mt-3">
                      Por favor, revisa tu bandeja de entrada y <strong>también la carpeta de spam o correo no deseado</strong> para activar tu cuenta.
                    </p>
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600">
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
                <Button
                  onClick={() => router.replace("/login")}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Ir a Iniciar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-25 via-white to-pink-50">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 mt-40 mb-20">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Crear Cuenta</CardTitle>
              <CardDescription className="text-gray-600">
                Únete a la comunidad de Jess Tendencia
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
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        {errors.name}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
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
                      autoComplete="new-password"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        {errors.confirmPassword}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/login"
                    className="text-pink-600 hover:text-pink-700 font-medium hover:underline"
                  >
                    Iniciar sesión
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
