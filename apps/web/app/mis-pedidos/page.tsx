"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@jess/shared/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Badge } from "@jess/ui/badge"
import { Button } from "@jess/ui/button"
import { Package, Eye, Truck, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@utils/supabase/client"

type OrderItem = {
  id: string
  quantity: number
  unit_price: number
  products?: { name: string } | null
}

type Order = {
  id: string
  order_number: string
  created_at: string
  status: string
  total: number
  order_items: OrderItem[]
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ENTREGADO":
    case "entregado":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Entregado
        </Badge>
      )
    case "EN_TRANSITO":
    case "en_transito":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Truck className="h-3 w-3 mr-1" />
          En tránsito
        </Badge>
      )
    case "PROCESANDO":
    case "procesando":
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Package className="h-3 w-3 mr-1" />
          Procesando
        </Badge>
      )
  }
}

export default function MisPedidosPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data.user
        if (!user) {
          setOrders([])
          setLoading(false)
          return
        }

        const res = await fetch(`/api/orders?userId=${user.id}`)
        const json = await res.json()
        if (json.success) {
          setOrders(json.orders as Order[])
        } else {
          setOrders([])
        }
      } catch (e) {
        console.error(e)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [supabase])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-4xl my-16">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mis Pedidos
              </h1>
              <p className="text-gray-600">Revisa el estado de tus compras</p>
            </div>

            {loading ? (
              <p className="text-gray-600">Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-600">
                Aún no tienes pedidos. Cuando compres algo, aparecerá aquí.
              </p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Pedido #{order.order_number || order.id}
                          </CardTitle>
                          <CardDescription>
                            Realizado el{" "}
                            {new Date(order.created_at).toLocaleDateString(
                              "es-CL",
                            )}
                          </CardDescription>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.products?.name || "Producto"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              {new Intl.NumberFormat("es-CL", {
                                style: "currency",
                                currency: "CLP",
                                minimumFractionDigits: 0,
                              }).format(item.unit_price * item.quantity)}
                            </p>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <div className="flex gap-2">
                            <Link href={`/mis-pedidos/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Button>
                            </Link>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-lg font-bold text-gray-900">
                              {new Intl.NumberFormat("es-CL", {
                                style: "currency",
                                currency: "CLP",
                                minimumFractionDigits: 0,
                              }).format(order.total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
