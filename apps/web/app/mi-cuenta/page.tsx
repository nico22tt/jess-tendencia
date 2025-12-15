'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Badge } from "@jess/ui/badge"
import { User, Edit, MapPin, Plus, Trash2, Home } from "lucide-react"

interface Address {
  id: string
  alias: string
  recipient_name: string
  phone_number: string
  address_line_1: string
  address_line_2: string
  city: string
  region: string
  zip_code: string
  is_default: boolean
}

interface Region {
  code: string
  name: string
}

export default function MiCuentaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      // Todo desde auth.users + user_metadata
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: "" // todavía sin persistir en BD
      })

      await Promise.all([
        fetchRegions(),
        fetchAddresses(user.id)
      ])

      setLoading(false)
    }
    fetchUser()
  }, [supabase, router])

  const fetchRegions = async () => {
    try {
      const res = await fetch("/api/user/addresses?regions=true")
      if (res.ok) {
        const data = await res.json()
        setRegions(data)
      }
    } catch (error) {
      console.error("Error cargando regiones:", error)
    }
  }

  const fetchAddresses = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/addresses?user_id=${userId}`)
      if (res.ok) {
        const addresses = await res.json()
        setSavedAddresses(addresses)
      }
    } catch (error) {
      console.error("Error cargando direcciones:", error)
    }
  }

  const handleSave = async () => {
    if (!user) return
    try {
      // Solo actualiza metadatos (name) en auth.users
      const { error } = await supabase.auth.updateUser({
        data: { name: formData.name }
      })

      if (error) throw error
      alert("✅ Información actualizada exitosamente")
      setIsEditing(false)
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      alert("❌ Error al actualizar. Intenta de nuevo.")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta dirección?")) return
    try {
      const res = await fetch("/api/user/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error("Error eliminando dirección")
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id))
      alert("✅ Dirección eliminada")
    } catch (error) {
      console.error("Error eliminando dirección:", error)
      alert("❌ Error al eliminar. Intenta de nuevo.")
    }
  }

  if (loading) return <div className="py-24 text-center text-xl">Cargando...</div>

  return (
    <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl my-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="grid gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-pink-600" />
                Información Personal
              </CardTitle>
              <CardDescription>Actualiza tu información de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className={isEditing ? "" : "bg-gray-100"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  placeholder="Ej: +56 9 1234 5678"
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600">
                      Guardar cambios
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar información
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Direcciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    Direcciones de Envío
                  </CardTitle>
                  <CardDescription>Gestiona tus direcciones de despacho</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push("/mi-cuenta/nueva-direccion")}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva dirección
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No tienes direcciones guardadas</p>
                  <p className="text-sm text-gray-500">
                    Agrega una dirección para facilitar tus compras
                  </p>
                </div>
              ) : (
                savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-lg border p-4 flex items-start justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <b className="text-gray-800">{addr.alias}</b>
                        {addr.is_default && (
                          <Badge className="bg-pink-500 text-white">Principal</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        {addr.recipient_name} · {addr.phone_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {addr.address_line_1}{" "}
                        {addr.address_line_2 && `- ${addr.address_line_2}`}, {addr.city},{" "}
                        {regions.find((x) => x.code === addr.region)?.name || addr.region}, CP{" "}
                        {addr.zip_code}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/mi-cuenta/editar-direccion/${addr.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
