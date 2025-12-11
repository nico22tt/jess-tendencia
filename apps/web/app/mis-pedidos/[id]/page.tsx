"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@jess/shared/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  if (!orderId) return

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" })
      const text = await res.text()
      console.log("ORDER DETAIL status:", res.status)
      console.log("ORDER DETAIL raw body:", text)

      let data: any = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (e) {
        console.error("Error parseando JSON de /api/orders/[id]:", e)
      }

      if (!res.ok || !data.success) {
        console.error("Error API orden:", data)
        setOrder(null)
      } else {
        setOrder(data.order)
      }
    } catch (e) {
      console.error("fetch /api/orders error:", e)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  loadOrder()
}, [orderId])


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => router.push("/mi-cuenta/mis-pedidos")}
              className="mb-6 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Pedidos
            </Button>

            {loading ? (
              <p>Cargando pedido...</p>
            ) : !order ? (
              <p>Pedido no encontrado.</p>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Pedido #{order.order_number || order.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Fecha:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("es-CL")
                      : "-"}
                  </p>
                  <p>
                    Total:{" "}
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(order.total || 0)}
                  </p>
                  <div>
                    <p className="font-semibold mb-2">Productos:</p>
                    <ul className="space-y-1">
                      {(order.order_items || []).map((item: any) => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.products?.name || "Producto"}</span>
                          <span>
                            x{item.quantity} (
                            {new Intl.NumberFormat("es-CL", {
                              style: "currency",
                              currency: "CLP",
                              minimumFractionDigits: 0,
                            }).format(item.unit_price * item.quantity)}
                            )
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/">Volver a la tienda</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
