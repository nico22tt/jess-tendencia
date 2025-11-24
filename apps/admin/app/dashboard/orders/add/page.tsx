"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Textarea } from "@jess/ui/textarea"
import { Card } from "@jess/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  Loader2,
  ShoppingCart,
  User,
  Package,
  MapPin
} from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  sku: string
  basePrice: number
  stock: number
  images: any
}

interface User {
  id: string
  name: string
  email: string
}

interface OrderItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Estados para productos y usuarios
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Estados del formulario
  const [selectedUserId, setSelectedUserId] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [searchProduct, setSearchProduct] = useState("")
  
  // Datos de envío
  const [shippingName, setShippingName] = useState("")
  const [shippingEmail, setShippingEmail] = useState("")
  const [shippingPhone, setShippingPhone] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingRegion, setShippingRegion] = useState("")
  const [shippingZip, setShippingZip] = useState("")
  
  // Otros
  const [shippingCost, setShippingCost] = useState("0")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [orderStatus, setOrderStatus] = useState("PENDING")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoadingData(true)
      
      // Cargar productos
      const productsRes = await fetch("/api/products")
      const productsData = await productsRes.json()
      
      // Cargar usuarios
      const usersRes = await fetch("/api/users")
      const usersData = await usersRes.json()
      
      if (productsData.success) {
        setProducts(productsData.data)
      }
      
      if (usersData.success) {
        setUsers(usersData.data)
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      alert("Error al cargar datos")
    } finally {
      setLoadingData(false)
    }
  }

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      // Incrementar cantidad si ya existe
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      // Agregar nuevo producto
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.basePrice,
        subtotal: product.basePrice
      }])
    }
    
    setSearchProduct("")
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }
    
    setOrderItems(orderItems.map(item =>
      item.productId === productId
        ? { ...item, quantity, subtotal: quantity * item.unitPrice }
        : item
    ))
  }

  const removeProduct = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const shipping = parseFloat(shippingCost) || 0
    const tax = subtotal * 0.19 // 19% IVA (ajusta según tu país)
    const total = subtotal + shipping + tax
    
    return { subtotal, shipping, tax, total }
  }

  const handleSubmit = async () => {
    // Validaciones
    if (!selectedUserId) {
      alert("Selecciona un cliente")
      return
    }
    
    if (orderItems.length === 0) {
      alert("Agrega al menos un producto")
      return
    }
    
    if (!shippingName || !shippingAddress || !shippingCity) {
      alert("Completa los datos de envío")
      return
    }

    try {
      setLoading(true)
      
      const totals = calculateTotals()
      
      const orderData = {
        userId: selectedUserId,
        status: orderStatus,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        shippingName,
        shippingEmail,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingRegion,
        shippingZip,
        paymentMethod,
        notes
      }
      
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        alert("Orden creada exitosamente")
        router.push(`/dashboard/transactions/${data.data.id}`)
      } else {
        alert("Error al crear orden: " + (data.error || ""))
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear orden")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const totals = calculateTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loadingData) {
    return (
      <div className="flex h-screen bg-zinc-950">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/transactions">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white">Crear Pedido Manual</h1>
                  <p className="text-zinc-400 mt-1">Crea un pedido para un cliente existente</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda - Productos y datos */}
              <div className="lg:col-span-2 space-y-6">
                {/* Seleccionar Cliente */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-pink-600" />
                    <h2 className="text-xl font-semibold text-white">Cliente</h2>
                  </div>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id} className="text-white">
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>

                {/* Agregar Productos */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-pink-600" />
                    <h2 className="text-xl font-semibold text-white">Productos</h2>
                  </div>
                  
                  {/* Buscador de productos */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Buscar producto por nombre o SKU..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  {/* Resultados de búsqueda */}
                  {searchProduct && (
                    <div className="mb-4 max-h-48 overflow-y-auto bg-zinc-800 rounded-lg border border-zinc-700">
                      {filteredProducts.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4">No se encontraron productos</p>
                      ) : (
                        filteredProducts.slice(0, 5).map(product => (
                          <button
                            key={product.id}
                            onClick={() => addProductToOrder(product)}
                            className="w-full text-left p-3 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0"
                          >
                            <p className="text-white font-medium">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-zinc-400">SKU: {product.sku}</span>
                              <span className="text-xs text-zinc-400">•</span>
                              <span className="text-xs text-pink-400">{formatCurrency(product.basePrice)}</span>
                              <span className="text-xs text-zinc-400">•</span>
                              <span className="text-xs text-zinc-400">Stock: {product.stock}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Lista de productos agregados */}
                  <div className="space-y-3">
                    {orderItems.length === 0 ? (
                      <p className="text-zinc-500 text-center py-8">No hay productos agregados</p>
                    ) : (
                      orderItems.map(item => (
                        <div key={item.productId} className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.productName}</p>
                            <p className="text-sm text-zinc-400">SKU: {item.sku}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                              className="w-20 bg-zinc-700 border-zinc-600 text-white text-center"
                            />
                            <span className="text-zinc-400">×</span>
                            <span className="text-white font-medium w-24 text-right">
                              {formatCurrency(item.unitPrice)}
                            </span>
                          </div>
                          <div className="text-right w-28">
                            <p className="text-white font-semibold">{formatCurrency(item.subtotal)}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProduct(item.productId)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Dirección de envío */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    <h2 className="text-xl font-semibold text-white">Dirección de Envío</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Nombre completo</Label>
                      <Input
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Email</Label>
                      <Input
                        type="email"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="juan@example.com"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Teléfono</Label>
                      <Input
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Ciudad</Label>
                      <Input
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="Santiago"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Región</Label>
                      <Input
                        value={shippingRegion}
                        onChange={(e) => setShippingRegion(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="Metropolitana"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Código Postal</Label>
                      <Input
                        value={shippingZip}
                        onChange={(e) => setShippingZip(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="8320000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-zinc-300">Dirección</Label>
                      <Input
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="Av. Providencia 1234, Depto 501"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Columna derecha - Resumen */}
              <div className="space-y-6">
                {/* Totales */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Resumen</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Envío:</span>
                      <Input
                        type="number"
                        min="0"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        className="w-32 bg-zinc-800 border-zinc-700 text-white text-right"
                      />
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>IVA (19%):</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="pt-3 border-t border-zinc-700 flex justify-between text-white text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-pink-600">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </Card>

                {/* Opciones adicionales */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Opciones</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-zinc-300">Estado inicial</Label>
                      <Select value={orderStatus} onValueChange={setOrderStatus}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="PENDING" className="text-white">Pendiente</SelectItem>
                          <SelectItem value="PAID" className="text-white">Pagado</SelectItem>
                          <SelectItem value="PROCESSING" className="text-white">Procesando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-zinc-300">Método de pago</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="cash" className="text-white">Efectivo</SelectItem>
                          <SelectItem value="transfer" className="text-white">Transferencia</SelectItem>
                          <SelectItem value="credit_card" className="text-white">Tarjeta</SelectItem>
                          <SelectItem value="debit_card" className="text-white">Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-zinc-300">Notas (opcional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        placeholder="Notas adicionales sobre el pedido..."
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>

                {/* Botón crear */}
                <Button
                  onClick={handleSubmit}
                  disabled={loading || orderItems.length === 0}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Crear Pedido
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
