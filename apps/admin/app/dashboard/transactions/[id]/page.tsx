"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { Card } from "@jess/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jess/ui/select"
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface OrderDetail {
  id: string
  order_number: string
  status: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  shipping_name: string
  shipping_email: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_region: string
  shipping_zip: string
  notes: string | null
  tracking_number: string | null
  payment_method: string | null
  created_at: string
  updated_at: string
  users: {
    id: string
    name: string
    email: string
  }
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    products: {
      id: string
      name: string
      sku: string
      images: any
    }
  }>
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const orderId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    checkAuth()
    fetchOrder()
  }, [orderId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
  }

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()

      if (data.success) {
        const o = data.order || data.data || data
        setOrder(o)
        setNewStatus(o.status)
      } else {
        alert("Error al cargar la orden")
        router.push("/dashboard/transactions")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar la orden")
      router.push("/dashboard/transactions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return

    try {
      setIsSaving(true)
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (data.success) {
        const o = data.order || data.data || data
        setOrder(o)
        alert("Estado actualizado correctamente")
      } else {
        alert("Error al actualizar estado")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar estado")
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      PENDING: {
        label: "Pendiente",
        className:
          "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      },
      PAID: {
        label: "Pagado",
        className: "bg-green-600/20 text-green-400 border-green-600/30",
      },
      PROCESSING: {
        label: "Procesando",
        className: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      },
      SHIPPED: {
        label: "Enviado",
        className:
          "bg-purple-600/20 text-purple-400 border-purple-600/30",
      },
      DELIVERED: {
        label: "Entregado",
        className: "bg-green-600/20 text-green-400 border-green-600/30",
      },
      CANCELLED: {
        label: "Cancelado",
        className: "bg-red-600/20 text-red-400 border-red-600/30",
      },
      REFUNDED: {
        label: "Reembolsado",
        className:
          "bg-orange-600/20 text-orange-400 border-orange-600/30",
      },
    }
    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-center">
          Cargando orden...
        </p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/transactions">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:bg-muted bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {order.order_number}
              </h1>
              <p className="text-muted-foreground mt-1">
                Creado el {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Items y totales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items de la orden */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-pink-600" />
                <h2 className="text-xl font-semibold text-foreground">
                  Productos
                </h2>
              </div>
              <div className="space-y-4">
                {order.order_items.map((item) => {
                  // Normalizar imágenes
                  let imageUrl: string | null = null
                  const imagesRaw = item.products.images

                  try {
                    if (Array.isArray(imagesRaw)) {
                      if (typeof imagesRaw[0] === "string") {
                        imageUrl = imagesRaw[0]
                      } else if (imagesRaw[0]?.url) {
                        imageUrl = imagesRaw[0].url
                      }
                    } else if (typeof imagesRaw === "string") {
                      const parsed = JSON.parse(imagesRaw)
                      if (Array.isArray(parsed)) {
                        if (typeof parsed[0] === "string") {
                          imageUrl = parsed[0]
                        } else if (parsed[0]?.url) {
                          imageUrl = parsed[0].url
                        }
                      }
                    } else if (
                      imagesRaw &&
                      typeof imagesRaw === "object" &&
                      imagesRaw.url
                    ) {
                      imageUrl = imagesRaw.url
                    }
                  } catch {
                    imageUrl = null
                  }

                  if (!imageUrl) {
                    imageUrl = "/placeholder.png"
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <img
                        src={imageUrl}
                        alt={item.products.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-foreground font-medium">
                          {item.products.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.products.sku}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-muted-foreground">
                            Cantidad: {item.quantity}
                          </span>
                          <span className="text-muted-foreground">
                            Precio:{" "}
                            {formatCurrency(item.unit_price)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-semibold">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Totales */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Resumen de Pago
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío:</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Impuestos:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border flex justify-between text-foreground text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-pink-600">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna derecha - Información */}
          <div className="space-y-6">
            {/* Cliente */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Cliente
              </h2>
              <div className="space-y-2">
                <p className="text-foreground font-medium">
                  {order.users.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.users.email}
                </p>
              </div>
            </Card>

            {/* Dirección de envío */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-pink-600" />
                <h2 className="text-lg font-semibold text-foreground">
                  Dirección de Envío
                </h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">
                  {order.shipping_name}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_phone}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_city}, {order.shipping_region}
                </p>
                <p className="text-muted-foreground">
                  CP: {order.shipping_zip}
                </p>
              </div>
            </Card>

            {/* Método de pago */}
            {order.payment_method && (
              <Card className="bg-card border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Método de Pago
                  </h2>
                </div>
                <p className="text-muted-foreground capitalize">
                  {order.payment_method}
                </p>
              </Card>
            )}

            {/* Cambiar estado */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Actualizar Estado
              </h2>
              <div className="space-y-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value="PENDING" className="text-foreground">
                      Pendiente
                    </SelectItem>
                    <SelectItem value="PAID" className="text-foreground">
                      Pagado
                    </SelectItem>
                    <SelectItem
                      value="PROCESSING"
                      className="text-foreground"
                    >
                      Procesando
                    </SelectItem>
                    <SelectItem
                      value="SHIPPED"
                      className="text-foreground"
                    >
                      Enviado
                    </SelectItem>
                    <SelectItem
                      value="DELIVERED"
                      className="text-foreground"
                    >
                      Entregado
                    </SelectItem>
                    <SelectItem
                      value="CANCELLED"
                      className="text-foreground"
                    >
                      Cancelado
                    </SelectItem>
                    <SelectItem
                      value="REFUNDED"
                      className="text-foreground"
                    >
                      Reembolsado
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isSaving || newStatus === order.status}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-foreground"
                >
                  {isSaving ? "Guardando..." : "Actualizar Estado"}
                </Button>
              </div>
            </Card>

            {/* Notas */}
            {order.notes && (
              <Card className="bg-card border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-pink-600" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Notas
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  {order.notes}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
