'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Badge } from "@jess/ui/badge"
import { User, Edit, MapPin, Home, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"

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

// 16 regiones de Chile (corregidas)
const REGIONES = [
  { value: "arica", label: "Región de Arica y Parinacota" },
  { value: "tarapaca", label: "Región de Tarapacá" },
  { value: "antofagasta", label: "Región de Antofagasta" },
  { value: "atacama", label: "Región de Atacama" },
  { value: "coquimbo", label: "Región de Coquimbo" },
  { value: "valparaiso", label: "Región de Valparaíso" },
  { value: "rm", label: "Región Metropolitana de Santiago" },
  { value: "ohiggins", label: "Región del Libertador Gral. Bernardo O'Higgins" },
  { value: "maule", label: "Región del Maule" },
  { value: "nuble", label: "Región de Ñuble" },
  { value: "biobio", label: "Región del Biobío" },
  { value: "araucania", label: "Región de La Araucanía" },
  { value: "losrios", label: "Región de Los Ríos" },
  { value: "loslagos", label: "Región de Los Lagos" },
  { value: "aysen", label: "Región de Aysén del Gral. Carlos Ibáñez del Campo" },
  { value: "magallanes", label: "Región de Magallanes y de la Antártica Chilena" },
]

// Comunas por región (corregidas y expandidas)
const COMUNAS: Record<string, string[]> = {
  arica: ["Arica", "Camarones", "Putre", "General Lagos"],
  tarapaca: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  antofagasta: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  atacama: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  coquimbo: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  valparaiso: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "La Calera", "Hijuelas", "La Cruz", "Limache", "Nogales", "Olmué", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llay-Llay", "Panquehue", "Putaendo", "Santa María"],
  rm: ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura","Puente Alto", "Pirque", "San José de Maipo","Colina", "Lampa", "Tiltil","San Bernardo", "Buin", "Calera de Tango", "Paine","Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro","Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  ohiggins: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente de Tagua Tagua", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  maule: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas", "Cauquenes", "Chanco", "Pelluhue"],
  nuble: ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Treguaco", "San Carlos", "Coihueco", "San Fabián", "San Nicolás"],
  biobio: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Lebu", "Los Álamos", "Tirúa"],
  araucania: ["Temuco", "Carahue", "Cholchol", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Angol", "Collipulli", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  losrios: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  loslagos: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Maullín", "Puerto Varas", "Llanquihue", "Ancud", "Castro", "Chaitén", "Chonchi", "Curaco de Vélez", "Dalcahue", "Futaleufú", "Hualaihué", "Palena", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo"],
  aysen: ["Coyhaique", "Lago Verde", "Aisén", "Cisnes", "Guaitecas", "Chile Chico", "Río Ibáñez", "Cochrane", "O'Higgins", "Tortel"],
  magallanes: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Puerto Natales", "Torres del Paine"]
}

const initialAddressState: Address = {
  id: '',
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
  const [addressData, setAddressData] = useState<Address>(initialAddressState)
  const [orders, setOrders] = useState<any[]>([])

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
        phone: "" // Se cargará abajo
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


      // Cargar pedidos
      const { data: pedidos } = await supabase.from("orders").select("*").eq("user_id", user.id)
      setOrders(pedidos || [])
      setLoading(false)
    }
    fetchUser()
  }, [supabase, router])

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
    const { alias, address_line_1, city, region, zip_code } = addressData
    if (!alias || !address_line_1 || !city || !region || !zip_code) {
      alert("⚠️ Completa todos los campos requeridos.")
      return
    }

    try {
      let id = addressData.id || crypto.randomUUID()
      // Si se marca como principal, primero quitar el default de las demás
      if (addressData.is_default) {
        await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id)
      }
      if (!addressData.id) {
        await supabase.from("user_addresses").insert({ ...addressData, id, user_id: user.id })
      } else {
        await supabase.from("user_addresses").update({ ...addressData }).eq("id", addressData.id)
      }
      alert(`✅ Dirección ${addressData.id ? "actualizada" : "guardada"} exitosamente`)
      setAddressData(initialAddressState)
      const { data: addresses } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
      setSavedAddresses(addresses || [])
    } catch (error) {
      console.error("Error guardando dirección:", error)
      alert("❌ Error al guardar la dirección. Intenta de nuevo.")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta dirección?")) return
    try {
      const { error } = await supabase.from("user_addresses").delete().eq("id", id)
      if (error) throw error
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id))
      if (addressData.id === id) setAddressData(initialAddressState)
      alert("✅ Dirección eliminada")
    } catch (error) {
      console.error("Error eliminando dirección:", error)
      alert("❌ Error al eliminar. Intenta de nuevo.")
    }
  }

  if (loading) return <div className="py-24 text-center text-xl">Cargando...</div>

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl my-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>
        <div className="grid gap-6 md">
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
                <Input id="name" value={formData.name} placeholder="Nombre completo" title="Nombre completo" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={formData.email} placeholder="Correo electrónico" title="Correo electrónico" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={formData.phone} placeholder="Ej: +56 9 1234 5678" title="Teléfono"
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
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-pink-600" />Direcciones de Envío
              </CardTitle>
              <CardDescription>Vinculadas a tus despachos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="rounded border p-3 flex items-start justify-between bg-white shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <b className="text-gray-800">{addr.alias}</b>
                      {addr.is_default && <Badge className="bg-pink-500 text-white">Principal</Badge>}
                    </div>
                    <div className="text-sm text-gray-700">{addr.recipient_name} {addr.phone_number && <>· {addr.phone_number}</>}</div>
                    <div className="text-sm text-gray-600">{addr.address_line_1} {addr.address_line_2 && `- ${addr.address_line_2}`}, {addr.city}, {REGIONES.find(x => x.value === addr.region)?.label}, CP {addr.zip_code}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-center pl-2">
                    <Button size="sm" variant="outline" title="Editar" onClick={() => setAddressData(addr)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Eliminar" onClick={() => handleDeleteAddress(addr.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <form className="space-y-3 pt-4 border-t" onSubmit={e => { e.preventDefault(); handleSaveAddress(); }}>
                <h3 className="font-semibold text-gray-700">
                  {addressData.id ? `Editar: ${addressData.alias}` : "Añadir Nueva Dirección"}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias *</Label>
                  <Input id="alias" required placeholder="Ej: Casa, Oficina" title="Alias" value={addressData.alias}
                    onChange={e => setAddressData(a => ({ ...a, alias: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">A nombre de *</Label>
                  <Input id="recipient_name" required placeholder="Nombre del receptor" value={addressData.recipient_name}
                    onChange={e => setAddressData(a => ({ ...a, recipient_name: e.target.value }))} />
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
                <div className="space-y-2">
                  <Label htmlFor="region">Región *</Label>
                  <Select value={addressData.region}
                    onValueChange={(val) => setAddressData(a => ({ ...a, region: val, city: "" }))}>
                    <SelectTrigger id="region" title="Región" aria-label="Región" className="bg-white">
                      <SelectValue placeholder="Selecciona una región" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg max-h-60 overflow-auto z-50">
                      {REGIONES.map(x =>
                        <SelectItem key={x.value} value={x.value} className="data-[state=checked]:bg-pink-100 data-[state=checked]:text-pink-700">
                          {x.label}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Comuna *</Label>
                  <Select value={addressData.city}
                    onValueChange={(val) => setAddressData(a => ({ ...a, city: val }))}
                    disabled={!addressData.region}>
                    <SelectTrigger id="city" title="Comuna" aria-label="Comuna" className="bg-white">
                      <SelectValue placeholder="Selecciona una comuna" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg max-h-60 overflow-auto z-50">
                      {(COMUNAS[addressData.region] || []).map(comuna =>
                        <SelectItem key={comuna} value={comuna} className="data-[state=checked]:bg-pink-100 data-[state=checked]:text-pink-700">
                          {comuna}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">Código postal *</Label>
                  <Input id="zip_code" required placeholder="Ej: 8320000" value={addressData.zip_code}
                    onChange={e => setAddressData(a => ({ ...a, zip_code: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input id="is_default" type="checkbox" title="Dirección principal" aria-label="Dirección principal"
                    checked={addressData.is_default ?? false}
                    onChange={e => setAddressData(a => ({ ...a, is_default: e.target.checked }))}
                    className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500" />
                  <Label htmlFor="is_default" className="cursor-pointer">Dirección principal</Label>
                </div>
                <Button type="submit" className="mt-3 bg-pink-600 hover:bg-pink-700 text-white">
                  {addressData.id ? "Actualizar" : "Guardar dirección"}
                </Button>
                {addressData.id && (
                  <Button type="button" variant="outline" className="ml-2" onClick={() => setAddressData(initialAddressState)}>
                    Cancelar
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Mis Pedidos Realizados</h2>
          <Card>
            <CardContent className="p-4">
              {orders.length === 0
                ? <span className="text-gray-500 italic">No tienes pedidos previos.</span>
                : orders.map(ord =>
                  <div key={ord.id} className="mb-3 pb-3 border-b last:border-b-0">
                    <div className="font-semibold">Pedido #{ord.id}</div>
                    <div className="text-sm text-gray-600">Fecha: {ord.created_at?.slice(0,10)} | Total: ${(ord.total/100).toLocaleString("es-CL")}</div>
                  </div>)
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
