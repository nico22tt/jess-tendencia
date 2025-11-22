"use client"

import { useState } from "react"
import { useAuth } from "@jess/shared/contexts/auth-context"

export default function AdminLoginTest() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión")
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#18181b',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '2rem 2.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          minWidth: '320px'
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#18181b', textAlign: 'center' }}>
          Login Administrador
        </h2>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', fontSize: '1rem' }}
          autoComplete="username"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', fontSize: '1rem' }}
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            background: '#ec4899',
            color: '#fff',
            padding: '0.75rem',
            fontWeight: 500,
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: 'none',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? "Ingresando..." : "Login"}
        </button>
        {error &&
          <div style={{ color: '#ef4444', fontSize: '0.95rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        }
        {user &&
          <div style={{
            background: '#f3f4f6',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            color: '#18181b'
          }}>
            Usuario: {user.email} <br />
            Rol: {user.role}
          </div>
        }
      </form>
    </div>
  )
}
