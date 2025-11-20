"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Separator } from "@jess/ui/separator"
import { cn } from "@jess/ui/utils"
import { Store, Package, CreditCard, Truck, Bell, Palette } from "lucide-react"
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
  const [activeSection, setActiveSection] = useState("general")

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h1>
              <p className="text-zinc-400">Administra la configuración de tu tienda online</p>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Navigation Sidebar */}
              <Card className="col-span-3 bg-zinc-900 border-zinc-800 p-4">
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
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Configuración General</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Información básica de tu tienda online
                      </CardDescription>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-zinc-300">
                          Nombre de la Tienda
                        </Label>
                        <Input
                          id="storeName"
                          type="text"
                          defaultValue="Jess Tendencia"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="storeEmail" className="text-zinc-300">
                          Email de Contacto
                        </Label>
                        <Input
                          id="storeEmail"
                          type="email"
                          defaultValue="contacto@jesstendencia.com"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="storePhone" className="text-zinc-300">
                          Teléfono
                        </Label>
                        <Input
                          id="storePhone"
                          type="tel"
                          defaultValue="+56 9 1234 5678"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-zinc-300">
                          Zona Horaria
                        </Label>
                        <Select defaultValue="santiago">
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="santiago">Santiago (GMT-3)</SelectItem>
                            <SelectItem value="buenos-aires">Buenos Aires (GMT-3)</SelectItem>
                            <SelectItem value="sao-paulo">São Paulo (GMT-3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="bg-zinc-800" />

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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Gestión de Productos</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configura cómo se manejan los productos en tu tienda
                      </CardDescription>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-zinc-300">Mostrar productos agotados</Label>
                          <p className="text-sm text-zinc-500">Los productos sin stock seguirán visibles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-zinc-300">Alertas de inventario bajo</Label>
                          <p className="text-sm text-zinc-500">Recibe notificaciones cuando el stock sea bajo</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lowStock" className="text-zinc-300">
                          Umbral de stock bajo
                        </Label>
                        <Input
                          id="lowStock"
                          type="number"
                          defaultValue="5"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <Separator className="bg-zinc-800" />

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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Configuración de Pagos</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Gestiona los métodos de pago aceptados
                      </CardDescription>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Moneda Principal</Label>
                        <Select defaultValue="clp">
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
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
                        <Label className="text-zinc-300">Métodos de Pago Activos</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-zinc-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Tarjetas de Crédito/Débito</p>
                                <p className="text-xs text-zinc-500">Visa, Mastercard, American Express</p>
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                            <div className="flex items-center gap-3">
                              <Store className="h-5 w-5 text-zinc-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Transferencia Bancaria</p>
                                <p className="text-xs text-zinc-500">Pago directo a cuenta bancaria</p>
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-zinc-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Pago Contra Entrega</p>
                                <p className="text-xs text-zinc-500">Pago en efectivo al recibir</p>
                              </div>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-zinc-800" />

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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Envíos y Entregas</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configura las opciones de envío para tus clientes
                      </CardDescription>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-zinc-300">Envío gratuito</Label>
                          <p className="text-sm text-zinc-500">Ofrecer envío sin costo en compras mayores</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="freeShipping" className="text-zinc-300">
                          Monto mínimo para envío gratuito
                        </Label>
                        <Input
                          id="freeShipping"
                          type="number"
                          defaultValue="50000"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shippingCost" className="text-zinc-300">
                          Costo de envío estándar
                        </Label>
                        <Input
                          id="shippingCost"
                          type="number"
                          defaultValue="5000"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryTime" className="text-zinc-300">
                          Tiempo de entrega estimado (días)
                        </Label>
                        <Input
                          id="deliveryTime"
                          type="text"
                          defaultValue="3-5 días hábiles"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <Separator className="bg-zinc-800" />

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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Notificaciones</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configura cómo y cuándo recibir notificaciones
                      </CardDescription>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-4">
                        <Label className="text-zinc-300">Notificaciones por Email</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm text-white">Nuevos pedidos</p>
                              <p className="text-xs text-zinc-500">Recibe un email cuando llegue un nuevo pedido</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm text-white">Stock bajo</p>
                              <p className="text-xs text-zinc-500">Alerta cuando un producto tenga poco inventario</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm text-white">Nuevos usuarios</p>
                              <p className="text-xs text-zinc-500">Notificación cuando se registre un nuevo usuario</p>
                            </div>
                            <Switch />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm text-white">Reseñas de productos</p>
                              <p className="text-xs text-zinc-500">Alerta cuando un cliente deje una reseña</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-zinc-800" />

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
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Apariencia</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Personaliza el aspecto visual de tu tienda
                      </CardDescription>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Color Principal</Label>
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-lg bg-pink-400 border-2 border-white cursor-pointer" />
                          <div className="w-12 h-12 rounded-lg bg-purple-500 border-2 border-transparent cursor-pointer" />
                          <div className="w-12 h-12 rounded-lg bg-blue-500 border-2 border-transparent cursor-pointer" />
                          <div className="w-12 h-12 rounded-lg bg-green-500 border-2 border-transparent cursor-pointer" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo" className="text-zinc-300">
                          Logo de la Tienda
                        </Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <Store className="h-8 w-8 text-zinc-600" />
                          </div>
                          <Button
                            variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                          >
                            Cambiar Logo
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-zinc-300">Modo Oscuro</Label>
                          <p className="text-sm text-zinc-500">Usar tema oscuro en el panel de administración</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator className="bg-zinc-800" />

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
        </main>
      </div>
    </div>
  )
}
