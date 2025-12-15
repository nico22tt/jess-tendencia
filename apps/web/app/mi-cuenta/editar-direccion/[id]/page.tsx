'use client'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react"

interface Region {
  code: string
  name: string
}

export default function EditarDireccionPage() {
  const router = useRouter()
  const params = useParams()
  const addressId = params.id as string
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [communes, setCommunes] = useState<string[]>([])
  const [loadingCommunes, setLoadingCommunes] = useState(false)

  const [formData, setFormData] = useState({
    alias: '',
    recipient_name: '',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    region: '',
    zip_code: '',
    is_default: false,
  })

  useEffect(() => {
    checkAuth()
    fetchRegions()
  }, [])

  useEffect(() => {
    if (user && addressId) {
      fetchAddress()
    }
  }, [user, addressId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    setUser(user)
  }

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

  const fetchAddress = async () => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/user/addresses?user_id=${user.id}`)
      if (res.ok) {
        const addresses = await res.json()
        const address = addresses.find((a: any) => a.id === addressId)
        
        if (!address) {
          alert("❌ Dirección no encontrada")
          router.push("/mi-cuenta")
          return
        }

        setFormData({
          alias: address.alias,
          recipient_name: address.recipient_name,
          phone_number: address.phone_number,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2 || '',
          city: address.city,
          region: address.region,
          zip_code: address.zip_code,
          is_default: address.is_default,
        })

        // Cargar comunas de la región actual
        if (address.region) {
          await fetchCommunes(address.region)
        }
      }
    } catch (error) {
      console.error("Error cargando dirección:", error)
      alert("❌ Error al cargar la dirección")
      router.push("/mi-cuenta")
    } finally {
      setLoading(false)
    }
  }

  const handleRegionChange = (regionCode: string) => {
    setFormData(prev => ({ ...prev, region: regionCode, city: "" }))
    fetchCommunes(regionCode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const { alias, recipient_name, phone_number, address_line_1, city, region, zip_code } = formData
    if (!alias || !recipient_name || !phone_number || !address_line_1 || !city || !region || !zip_code) {
      alert("⚠️ Completa todos los campos requeridos.")
      return
    }

    try {
      setSaving(true)

      const res = await fetch("/api/user/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: addressId, 
          user_id: user.id, 
          ...formData 
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error actualizando dirección")
      }

      alert("✅ Dirección actualizada exitosamente")
      router.push("/mi-cuenta")
    } catch (error: any) {
      console.error("Error actualizando dirección:", error)
      alert(`❌ ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    )
  }

  return (
    <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl my-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-600/10 rounded-lg">
              <MapPin className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Dirección</h1>
              <p className="text-gray-600 mt-1">Actualiza los datos de tu dirección</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Datos de la dirección</CardTitle>
              <CardDescription>Completa todos los campos requeridos (*)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias *</Label>
                  <Input 
                    id="alias" 
                    required 
                    placeholder="Ej: Casa, Oficina" 
                    value={formData.alias}
                    onChange={e => setFormData(prev => ({ ...prev, alias: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">A nombre de *</Label>
                  <Input 
                    id="recipient_name" 
                    required 
                    placeholder="Nombre del receptor" 
                    value={formData.recipient_name}
                    onChange={e => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Teléfono *</Label>
                <Input 
                  id="phone_number" 
                  required 
                  placeholder="Ej: +56 9 12345678" 
                  value={formData.phone_number}
                  onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_1">Calle y número *</Label>
                <Input 
                  id="address_line_1" 
                  required 
                  placeholder="Ej: Av. Siempre Viva 123" 
                  value={formData.address_line_1}
                  onChange={e => setFormData(prev => ({ ...prev, address_line_1: e.target.value }))} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_2">Referencia</Label>
                <Input 
                  id="address_line_2" 
                  placeholder="Depto, torre, detalles..." 
                  value={formData.address_line_2}
                  onChange={e => setFormData(prev => ({ ...prev, address_line_2: e.target.value }))} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Región *</Label>
                  <Select value={formData.region} onValueChange={handleRegionChange}>
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
                  <Select 
                    value={formData.city}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                    disabled={!formData.region || loadingCommunes}
                  >
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
                <Input 
                  id="zip_code" 
                  required 
                  placeholder="Ej: 8320000" 
                  value={formData.zip_code}
                  onChange={e => setFormData(prev => ({ ...prev, zip_code: e.target.value }))} 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="is_default" 
                  type="checkbox"
                  aria-label="Dirección principal"
                  title="Dirección principal"
                  checked={formData.is_default}
                  onChange={e => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500" 
                />
                <Label htmlFor="is_default" className="cursor-pointer">Establecer como dirección principal</Label>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar dirección
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  )
}
