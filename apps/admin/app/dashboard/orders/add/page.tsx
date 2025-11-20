"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Card } from "@jess/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jess/ui/table"
import { ShoppingCart, Plus, Trash2 } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export default function AddOrderPage() {
  // Customer Information
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [billingAddress, setBillingAddress] = useState("")

  // Order Products
  const [productSearch, setProductSearch] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: "1", name: "Zapatillas Deportivas Blancas", quantity: 2, unitPrice: 45990 },
    { id: "2", name: "Botas de Cuero Negras", quantity: 1, unitPrice: 89990 },
  ])

  // Payment and Summary
  const [shippingCost, setShippingCost] = useState("5000")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [orderStatus, setOrderStatus] = useState("")

  const subtotal = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const total = subtotal + Number.parseInt(shippingCost || "0")

  const handleAddProduct = () => {
    if (productSearch.trim()) {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        name: productSearch,
        quantity: 1,
        unitPrice: 29990,
      }
      setOrderItems([...orderItems, newItem])
      setProductSearch("")
    }
  }

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 0) {
      setOrderItems(orderItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const handleCreateOrder = () => {
    console.log("[v0] Creating order:", {
      customer: { customerName, customerEmail, customerPhone },
      addresses: { shippingAddress, billingAddress },
      items: orderItems,
      payment: { paymentMethod, shippingCost, subtotal, total },
      status: orderStatus,
    })
    alert("Pedido creado exitosamente (simulación)")
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-600/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Añadir Pedido Manualmente</h1>
                <p className="text-zinc-400 mt-1">
                  Crea un nuevo pedido ingresando la información del cliente y productos
                </p>
              </div>
            </div>

            {/* Form Card */}
            <Card className="bg-zinc-900 border-zinc-800 p-8">
              <div className="space-y-8">
                {/* Section 1: Customer Information */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-600/20 text-pink-600 text-sm font-bold">
                      1
                    </span>
                    Información del Cliente
                  </h2>
                  <div className="space-y-4 pl-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName" className="text-zinc-300">
                          Nombre del Cliente <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ej: Valentina Rodríguez"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="customerEmail" className="text-zinc-300">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="cliente@ejemplo.com"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerPhone" className="text-zinc-300">
                        Teléfono
                      </Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shippingAddress" className="text-zinc-300">
                        Dirección de Envío <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="shippingAddress"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Calle Principal 123, Depto 4B, Santiago"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="billingAddress" className="text-zinc-300">
                        Dirección de Facturación
                      </Label>
                      <Input
                        id="billingAddress"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Misma que dirección de envío"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Order Products */}
                <div className="pt-6 border-t border-zinc-800">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-600/20 text-pink-600 text-sm font-bold">
                      2
                    </span>
                    Productos de la Orden
                  </h2>
                  <div className="space-y-4 pl-10">
                    {/* Product Search */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="productSearch" className="text-zinc-300">
                          Buscar Producto
                        </Label>
                        <Input
                          id="productSearch"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Buscar por nombre o SKU..."
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          onKeyPress={(e) => e.key === "Enter" && handleAddProduct()}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddProduct} className="bg-pink-600 hover:bg-pink-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir Producto
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="border border-zinc-800 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-800/50 hover:bg-zinc-800/50">
                            <TableHead className="text-zinc-300">Producto</TableHead>
                            <TableHead className="text-zinc-300 text-center">Cantidad</TableHead>
                            <TableHead className="text-zinc-300 text-right">Precio Unitario</TableHead>
                            <TableHead className="text-zinc-300 text-right">Subtotal</TableHead>
                            <TableHead className="text-zinc-300 text-center">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                                No hay productos añadidos. Busca y añade productos para continuar.
                              </TableCell>
                            </TableRow>
                          ) : (
                            orderItems.map((item) => (
                              <TableRow key={item.id} className="border-zinc-800">
                                <TableCell className="text-white font-medium">{item.name}</TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value))}
                                    className="w-20 bg-zinc-800 border-zinc-700 text-white text-center mx-auto"
                                    min="1"
                                  />
                                </TableCell>
                                <TableCell className="text-white text-right">
                                  ${item.unitPrice.toLocaleString("es-CL")}
                                </TableCell>
                                <TableCell className="text-white text-right font-semibold">
                                  ${(item.quantity * item.unitPrice).toLocaleString("es-CL")}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Section 3: Summary and Payment */}
                <div className="pt-6 border-t border-zinc-800">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-600/20 text-pink-600 text-sm font-bold">
                      3
                    </span>
                    Resumen y Pago
                  </h2>
                  <div className="space-y-6 pl-10">
                    {/* Order Summary */}
                    <div className="bg-zinc-800/50 rounded-lg p-6 space-y-3">
                      <div className="flex justify-between text-zinc-300">
                        <span>Subtotal:</span>
                        <span className="font-semibold">${subtotal.toLocaleString("es-CL")}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Costo de Envío:</span>
                        <Input
                          type="number"
                          value={shippingCost}
                          onChange={(e) => setShippingCost(e.target.value)}
                          className="w-32 bg-zinc-800 border-zinc-700 text-white text-right"
                          placeholder="0"
                        />
                      </div>
                      <div className="pt-3 border-t border-zinc-700 flex justify-between text-white text-lg">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-pink-600">${total.toLocaleString("es-CL")}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label htmlFor="paymentMethod" className="text-zinc-300">
                        Método de Pago <span className="text-red-500">*</span>
                      </Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona un método de pago" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="card" className="text-white">
                            Tarjeta de Crédito/Débito
                          </SelectItem>
                          <SelectItem value="cash" className="text-white">
                            Efectivo
                          </SelectItem>
                          <SelectItem value="transfer" className="text-white">
                            Transferencia Bancaria
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Order Status */}
                    <div>
                      <Label htmlFor="orderStatus" className="text-zinc-300">
                        Estado Inicial del Pedido <span className="text-red-500">*</span>
                      </Label>
                      <Select value={orderStatus} onValueChange={setOrderStatus}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona el estado inicial" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="pending_payment" className="text-white">
                            Pendiente de Pago
                          </SelectItem>
                          <SelectItem value="paid" className="text-white">
                            Pagado
                          </SelectItem>
                          <SelectItem value="processing" className="text-white">
                            En Proceso
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleCreateOrder}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white text-lg py-6"
                    size="lg"
                    disabled={
                      orderItems.length === 0 || !customerName || !customerEmail || !paymentMethod || !orderStatus
                    }
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Confirmar y Crear Pedido
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
