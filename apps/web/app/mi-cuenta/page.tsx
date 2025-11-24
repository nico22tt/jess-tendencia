'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Badge } from "@jess/ui/badge"
import { User, Edit, MapPin, CreditCard, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@jess/ui/dialog"
import AddPaymentForm from "@/components/add-payment-form"

export default function MiCuentaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Datos para editar información
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [addressData, setAddressData] = useState({
    alias: "",
    region: "",
    city: "",
    street: "",
    additionalInfo: "",
  })
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Visa", last4: "1234", isDefault: true },
    { id: 2, type: "Mastercard", last4: "5678", isDefault: false },
    { id: 3, type: "Visa", last4: "9012", isDefault: false },
  ])

  // Obtener usuario autenticado al montar componente
  React.useEffect(() => {
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
        phone: "",        // Puedes extraerlo de otra tabla si lo tienes
        address: "",      // Ídem
      })
      setLoading(false)
    }
    fetchUser()
  }, [supabase, router])

  const handleSave = () => {
    // Mock save functionality - aquí deberías guardar en BD
    setIsEditing(false)
  }

  const handleSaveAddress = () => {
    // Aquí deberías guardar addressData en tu BD
    setIsEditing(false)
  }

  const handleDeletePayment = (id: number) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  const handleAddPayment = () => {
    setShowPaymentForm(true)
  }

  const handlePaymentFormSubmit = (data: any) => {
    const newMethod = {
      id: paymentMethods.length + 1,
      type: "Visa",
      last4: data.cardNumber.slice(-4),
      isDefault: false,
    }
    setPaymentMethods([...paymentMethods, newMethod])
    setShowPaymentForm(false)
  }

  if (loading) return <div className="py-24 text-center text-xl">Cargando...</div>

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl my-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tu dirección completa"
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

          {/* ... resto igual que tu ejemplo: Resumen, dirección, métodos de pago ... */}
          {/* Puedes dejar el resto igual, sólo actualiza el acceso al usuario y protección */}
        </div>

        {/* Dirección principal */}
        {/* Métodos de pago */}
        {/* Dialog para añadir tarjeta */}
      </div>
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Método de Pago</DialogTitle>
          </DialogHeader>
          <AddPaymentForm onSubmit={handlePaymentFormSubmit} onCancel={() => setShowPaymentForm(false)} />
        </DialogContent>
      </Dialog>
    </main>
  )
}
