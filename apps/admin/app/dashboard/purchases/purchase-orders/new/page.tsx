'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Badge } from "@jess/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { User, Edit, MapPin, Plus, Trash2, Home, X } from "lucide-react"

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

const initialAddressState: Omit<Address, 'id'> = {
  alias: '',
  recipient_name: '',
  phone_number: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  region: '',
  zip_code: '',
  is_default: false,
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
  const [addressData, setAddressData] = useState<Omit<Address, 'id'>>(initialAddressState)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  
  // Data from API
  const [regions, setRegions] = useState<Region[]>([])
  const [communes, setCommunes] = useState<string[]>([])
  const [loadingCommunes, setLoadingCommunes] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: ""
      })

      // Cargar teléfono desde profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single()

      if (profile?.phone) {
        setFormData(prev => ({ ...prev, phone: profile.phone }))
      }

      // Cargar regiones y direcciones
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

  const fetchCommunes = async (regionCode: string) => {
    if (!regionCode) return
    setLoadingCommunes(true)
    try {
      const res = await fetch(`/api/user/addresses?communes=true&region_code=${regionCode}`)
      if (res.ok) {
        const data = await res.json()
        setCommunes(data)
      }
    } catch (error) {
      console.error("Error cargando comunas:", error)
    } finally {
      setLoadingCommunes(false)
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
      const { error } = await supabase
        .from("profiles")
        .update({ phone: formData.phone })
        .eq("id", user.id)
      if (error) throw error
      alert("✅ Teléfono actualizado exitosamente")
      setIsEditing(false)
    } catch (error) {
      console.error("Error actualizando teléfono:", error)
      alert("❌ Error al actualizar. Intenta de nuevo.")
    }
  }

  const handleSaveAddress = async () => {
    if (!user) return
    const { alias, recipient_name, phone_number, address_line_1, city, region, zip_code } = addressData
    if (!alias || !recipient_name || !phone_number || !address_line_1 || !city || !region || !zip_code) {
      alert("⚠️ Completa todos los campos requeridos.")
      return
    }

    try {
      const method = editingAddressId ? "PUT" : "POST"
      const body = editingAddressId 
        ? { id: editingAddressId, user_id: user.id, ...addressData }
        : { user_id: user.id, ...addressData }

      const res = await fetch("/api/user/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error guardando dirección")
      }

      alert(`✅ Dirección ${editingAddressId ? "actualizada" : "guardada"} exitosamente`)
      setAddressData(initialAddressState)
      setEditingAddressId(null)
      setIsAddressDialogOpen(false)
      await fetchAddresses(user.id)
    } catch (error: any) {
      console.error("Error guardando dirección:", error)
      alert(`❌ ${error.message}`)
    }
  }

  const handleEditAddress = (addr: Address) => {
    const { id, ...rest } = addr
    setAddressData(rest)
    setEditingAddressId(id)
    setIsAddressDialogOpen(true)
    // Cargar comunas de la región seleccionada
    if (rest.region) {
      fetchCommunes(rest.region)
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

  const resetAddressForm = () => {
    setAddressData(initialAddressState)
    setEditingAddressId(null)
    setCommunes([])
  }

  const handleRegionChange = (regionCode: string) => {
    setAddressData(a => ({ ...a, region: regionCode, city: "" }))
    fetchCommunes(regionCode)
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
                <Input id="name" value={formData.name} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={formData.email} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={formData.phone} placeholder="Ej: +56 9 1234 5678"
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} disabled={!isEditing} />
              </div>
              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600">Guardar cambios</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />Editar información
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
                    onClick={() => router.push('/mi-cuenta/nueva-direccion')}
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
                  <p className="text-sm text-gray-500">Agrega una dirección para facilitar tus compras</p>
                </div>
              ) : (
                savedAddresses.map((addr) => (
                  <div key={addr.id} className="rounded-lg border p-4 flex items-start justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <b className="text-gray-800">{addr.alias}</b>
                        {addr.is_default && <Badge className="bg-pink-500 text-white">Principal</Badge>}
                      </div>
                      <div className="text-sm text-gray-700">{addr.recipient_name} · {addr.phone_number}</div>
                      <div className="text-sm text-gray-600">
                        {addr.address_line_1} {addr.address_line_2 && `- ${addr.address_line_2}`}, {addr.city}, {regions.find(x => x.code === addr.region)?.name || addr.region}, CP {addr.zip_code}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/mi-cuenta/editar-direccion/${addr.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAddress(addr.id)}>
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

      {/* ✅ MODAL MANUAL COMO EN PURCHASE ORDERS */}
      {isAddressDialogOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddressDialogOpen(false)
              resetAddressForm()
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAddressId ? "Editar dirección" : "Agregar nueva dirección"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Completa todos los campos para {editingAddressId ? "actualizar" : "guardar"} tu dirección de envío
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAddressDialogOpen(false)
                  resetAddressForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias *</Label>
                  <Input id="alias" required placeholder="Ej: Casa, Oficina" value={addressData.alias}
                    onChange={e => setAddressData(a => ({ ...a, alias: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">A nombre de *</Label>
                  <Input id="recipient_name" required placeholder="Nombre del receptor" value={addressData.recipient_name}
                    onChange={e => setAddressData(a => ({ ...a, recipient_name: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Teléfono *</Label>
                <Input id="phone_number" required placeholder="Ej: +56 9 12345678" value={addressData.phone_number}
                  onChange={e => setAddressData(a => ({ ...a, phone_number: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_1">Calle y número *</Label>
                <Input id="address_line_1" required placeholder="Ej: Av. Siempre Viva 123" value={addressData.address_line_1}
                  onChange={e => setAddressData(a => ({ ...a, address_line_1: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_2">Referencia</Label>
                <Input id="address_line_2" placeholder="Depto, torre, detalles..." value={addressData.address_line_2}
                  onChange={e => setAddressData(a => ({ ...a, address_line_2: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Región *</Label>
                  <Select value={addressData.region} onValueChange={handleRegionChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecciona una región" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg max-h-60 overflow-auto">
                      {regions.map(r =>
                        <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Comuna *</Label>
                  <Select value={addressData.city}
                    onValueChange={(val) => setAddressData(a => ({ ...a, city: val }))}
                    disabled={!addressData.region || loadingCommunes}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={loadingCommunes ? "Cargando..." : "Selecciona una comuna"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg max-h-60 overflow-auto">
                      {communes.map(comuna =>
                        <SelectItem key={comuna} value={comuna}>{comuna}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Código postal *</Label>
                <Input id="zip_code" required placeholder="Ej: 8320000" value={addressData.zip_code}
                  onChange={e => setAddressData(a => ({ ...a, zip_code: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="is_default" 
                  type="checkbox"
                  aria-label="Dirección principal"
                  title="Dirección principal"
                  checked={addressData.is_default ?? false}
                  onChange={e => setAddressData(a => ({ ...a, is_default: e.target.checked }))}
                  className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500" 
                />
                <Label htmlFor="is_default" className="cursor-pointer">Dirección principal</Label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-2 justify-end sticky bottom-0 bg-white">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddressDialogOpen(false)
                  resetAddressForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleSaveAddress} className="bg-pink-600 hover:bg-pink-700">
                {editingAddressId ? "Actualizar" : "Guardar dirección"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
