"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Separator } from "@jess/ui/separator"
import { cn } from "@jess/ui/utils"
import { Store, Package, CreditCard, Truck, Bell, Palette, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Switch } from "@jess/ui/switch"

const settingsNavigation = [
  { id: "general", name: "Configuración General", icon: Store },
  { id: "products", name: "Gestión de Productos", icon: Package },
  { id: "payments", name: "Configuración de Pagos", icon: CreditCard },
  { id: "shipping", name: "Envíos y Entregas", icon: Truck },
  { id: "notifications", name: "Notificaciones", icon: Bell },
  { id: "appearance", name: "Apariencia", icon: Palette },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("general")

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
    setLoading(false)
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Administra la configuración de tu tienda online</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Settings Navigation Sidebar */}
          <Card className="col-span-3 bg-card border-border p-4">
            <nav className="space-y-1">
              {settingsNavigation.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      isActive
                        ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </Card>

          {/* Settings Content */}
          <div className="col-span-9">
            {/* Configuración General */}
            {activeSection === "general" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Configuración General</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Información básica de tu tienda online
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-border" />
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-foreground">
                      Nombre de la Tienda
                    </Label>
                    <Input
                      id="storeName"
                      type="text"
                      defaultValue="Jess Tendencia"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeEmail" className="text-foreground">
                      Email de Contacto
                    </Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      defaultValue="contacto@jesstendencia.com"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storePhone" className="text-foreground">
                      Teléfono
                    </Label>
                    <Input
                      id="storePhone"
                      type="tel"
                      defaultValue="+56 9 1234 5678"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-foreground">
                      Zona Horaria
                    </Label>
                    <Select defaultValue="santiago">
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="santiago">Santiago (GMT-3)</SelectItem>
                        <SelectItem value="buenos-aires">Buenos Aires (GMT-3)</SelectItem>
                        <SelectItem value="sao-paulo">São Paulo (GMT-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gestión de Productos */}
            {activeSection === "products" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Gestión de Productos</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configura cómo se manejan los productos en tu tienda
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-border" />
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Mostrar productos agotados</Label>
                      <p className="text-sm text-muted-foreground">
                        Los productos sin stock seguirán visibles
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Alertas de inventario bajo</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones cuando el stock sea bajo
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStock" className="text-foreground">
                      Umbral de stock bajo
                    </Label>
                    <Input
                      id="lowStock"
                      type="number"
                      defaultValue="5"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuración de Pagos */}
            {activeSection === "payments" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Configuración de Pagos</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Gestiona los métodos de pago aceptados
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-border" />
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Moneda Principal</Label>
                    <Select defaultValue="clp">
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clp">Peso Chileno (CLP)</SelectItem>
                        <SelectItem value="usd">Dólar Estadounidense (USD)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-foreground">Métodos de Pago Activos</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Tarjetas de Crédito/Débito
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Visa, Mastercard, American Express
                            </p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Transferencia Bancaria</p>
                            <p className="text-xs text-muted-foreground">
                              Pago directo a cuenta bancaria
                            </p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Pago Contra Entrega</p>
                            <p className="text-xs text-muted-foreground">Pago en efectivo al recibir</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Envíos y Entregas */}
            {activeSection === "shipping" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Envíos y Entregas</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configura las opciones de envío para tus clientes
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-border" />
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Envío gratuito</Label>
                      <p className="text-sm text-muted-foreground">
                        Ofrecer envío sin costo en compras mayores
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeShipping" className="text-foreground">
                      Monto mínimo para envío gratuito
                    </Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      defaultValue="50000"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCost" className="text-foreground">
                      Costo de envío estándar
                    </Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      defaultValue="5000"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime" className="text-foreground">
                      Tiempo de entrega estimado (días)
                    </Label>
                    <Input
                      id="deliveryTime"
                      type="text"
                      defaultValue="3-5 días hábiles"
                      className="bg-muted border-border text-foreground focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notificaciones */}
            {activeSection === "notifications" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Notificaciones</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configura cómo y cuándo recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-border" />
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-foreground">Notificaciones por Email</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground">Nuevos pedidos</p>
                          <p className="text-xs text-muted-foreground">
                            Recibe un email cuando llegue un nuevo pedido
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground">Stock bajo</p>
                          <p className="text-xs text-muted-foreground">
                            Alerta cuando un producto tenga poco inventario
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground">Nuevos usuarios</p>
                          <p className="text-xs text-muted-foreground">
                            Notificación cuando se registre un nuevo usuario
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground">Reseñas de productos</p>
                          <p className="text-xs text-muted-foreground">
                            Alerta cuando un cliente deje una reseña
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Apariencia */}
            {activeSection === "appearance" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Apariencia</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Personaliza el aspecto visual de tu tienda
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-border" />
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Color Principal</Label>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-pink-400 border-2 border-white cursor-pointer" />
                      <div className="w-12 h-12 rounded-lg bg-purple-500 border-2 border-transparent cursor-pointer" />
                      <div className="w-12 h-12 rounded-lg bg-blue-500 border-2 border-transparent cursor-pointer" />
                      <div className="w-12 h-12 rounded-lg bg-green-500 border-2 border-transparent cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo" className="text-foreground">
                      Logo de la Tienda
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg bg-muted border border-border flex items-center justify-center">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                        Cambiar Logo
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Modo Oscuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Usar tema oscuro en el panel de administración
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
