"use client"

import { ProtectedRoute } from "@jess/shared/components/protected-route"
import { useAuth } from "@jess/shared/contexts/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } 

from "@jess/ui/card"
import { Button } 

from "@jess/ui/button"
import { Input } 

from "@jess/ui/input"
import { Label } 

from "@jess/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } 

from "@jess/ui/select"
import { Badge } 

from "@jess/ui/badge"
import { User, Edit, MapPin, CreditCard, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } 

from "@jess/ui/dialog"
import AddPaymentForm from "@/components/add-payment-form"

export default function MiCuentaPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
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

  const handleSave = () => {
    // Mock save functionality
    setIsEditing(false)
  }

  const handleSaveAddress = () => {
    console.log("Saving address:", addressData)
    // Mock save functionality
  }

  const handleDeletePayment = (id: number) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  const handleAddPayment = () => {
    setShowPaymentForm(true)
  }

  const handlePaymentFormSubmit = (data: any) => {
    console.log("New payment method:", data)
    // Mock add functionality - in real app, would save to backend
    const newMethod = {
      id: paymentMethods.length + 1,
      type: "Visa", // Would detect from card number
      last4: data.cardNumber.slice(-4),
      isDefault: false,
    }
    setPaymentMethods([...paymentMethods, newMethod])
    setShowPaymentForm(false)
  }

  return (
    <ProtectedRoute>
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

            <Card>
              <CardHeader>
                <CardTitle>Resumen de cuenta</CardTitle>
                <CardDescription>Tu actividad en Jess Tendencia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm font-medium">Pedidos realizados</span>
                  <span className="text-lg font-bold text-pink-600">3</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm font-medium">Productos favoritos</span>
                  <span className="text-lg font-bold text-pink-600">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm font-medium">Miembro desde</span>
                  <span className="text-sm text-gray-600">Enero 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-pink-600" />
                Gestionar Dirección Principal
              </CardTitle>
              <CardDescription>Actualiza tu dirección de envío predeterminada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias de Dirección</Label>
                  <Input
                    id="alias"
                    value={addressData.alias}
                    onChange={(e) => setAddressData((prev) => ({ ...prev, alias: e.target.value }))}
                    placeholder="Casa, Trabajo, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región/Estado</Label>
                  <Select
                    value={addressData.region}
                    onValueChange={(value) => setAddressData((prev) => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Selecciona una región" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metropolitana">Región Metropolitana</SelectItem>
                      <SelectItem value="valparaiso">Valparaíso</SelectItem>
                      <SelectItem value="biobio">Biobío</SelectItem>
                      <SelectItem value="araucania">La Araucanía</SelectItem>
                      <SelectItem value="los-lagos">Los Lagos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Comuna/Ciudad</Label>
                  <Select
                    value={addressData.city}
                    onValueChange={(value) => setAddressData((prev) => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Selecciona una comuna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="santiago">Santiago</SelectItem>
                      <SelectItem value="providencia">Providencia</SelectItem>
                      <SelectItem value="las-condes">Las Condes</SelectItem>
                      <SelectItem value="maipu">Maipú</SelectItem>
                      <SelectItem value="puente-alto">Puente Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Calle y Número</Label>
                  <Input
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setAddressData((prev) => ({ ...prev, street: e.target.value }))}
                    placeholder="Av. Principal 123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Información Adicional (Opcional)</Label>
                <Input
                  id="additionalInfo"
                  value={addressData.additionalInfo}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Depto 401, Torre B, Referencias, etc."
                />
              </div>

              <Button onClick={handleSaveAddress} className="bg-pink-500 hover:bg-pink-600">
                Guardar Dirección
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-pink-600" />
                Métodos de Pago Guardados
              </CardTitle>
              <CardDescription>Gestiona tus tarjetas y métodos de pago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {method.type} **** {method.last4}
                          </span>
                          {method.isDefault && (
                            <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">Predeterminado</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">Expira 12/25</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePayment(method.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleAddPayment} variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Nuevo Método de Pago
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Método de Pago</DialogTitle>
          </DialogHeader>
          <AddPaymentForm onSubmit={handlePaymentFormSubmit} onCancel={() => setShowPaymentForm(false)} />
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
