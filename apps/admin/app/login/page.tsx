"use client"

import { useState } from "react"
import { useAuth } from "@jess/shared/contexts/auth-context"

export default function AdminLoginTest() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Redirigir al dashboard si ya está logueado como admin
  if (user && user.role === "admin") {
    // Si usas el App Router, considera usar next/navigation useRouter para mejor manejo.
    window.location.href = "/dashboard" 
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      // Nota: Si el error es manejado en el contexto, se mostrará aquí
      setError(err.message ?? "Error al iniciar sesión")
    }
  }

  return (
    // Contenedor principal: min-h-screen, centrado, fondo bg-zinc-900 (equivalente a #18181b)
    <div className="min-h-screen flex justify-center items-center bg-zinc-900 p-4">
      
      <form
        onSubmit={handleSubmit}
        // Estilos del formulario: fondo blanco, padding, redondeado, sombra, ancho limitado
        className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-sm"
      >
        <h2 className="mb-6 text-xl font-semibold text-zinc-900 text-center">
          Login Administrador
        </h2>
        
        {/* Input Email */}
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          // Estilos del input: w-full, mb-4 (1rem), p-3 (0.75rem), text-base, border, redondeado
          className="w-full mb-4 p-3 text-base border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 transition"
          autoComplete="username"
          required
        />
        
        {/* Input Password */}
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          // Estilos del input: w-full, mb-6 (1.5rem), p-3, text-base, border, redondeado
          className="w-full mb-6 p-3 text-base border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 transition"
          autoComplete="current-password"
          required
        />
        
        {/* Botón de Ingreso */}
        <button
          type="submit"
          disabled={isLoading}
          // Estilos del botón: w-full, fondo rosa (bg-pink-500), texto blanco, padding, fw-medium (font-medium), redondeado
          className="w-full bg-pink-500 text-white p-3 font-medium rounded-lg mb-4 text-base transition duration-300 hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Ingresando..." : "Login"}
        </button>
        
        {/* Mensaje de Error */}
        {error &&
          // Estilos del error: color rojo (text-red-500), text-sm (0.95rem), centrado
          <div className="text-red-500 text-sm mb-4 text-center">
            {error}
          </div>
        }
        
        {/* Sección de Usuario (Mantenida por si la necesitas en desarrollo, pero con clases Tailwind) */}
        {user &&
          // Estilos del usuario: fondo gris claro (bg-gray-100), padding, redondeado, text-sm, color oscuro
          <div className="bg-gray-100 p-3 rounded-md text-sm text-zinc-900 mt-4">
            Usuario: {user.email} <br />
            Rol: {user.role}
          </div>
        }
      </form>
    </div>
  )
}