"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@jess/ui/button"

type OrderItem = {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  size?: string | null
}

type Order = {
  id: string
  order_number: string
  status: string
  total: number
  client_name: string
  client_email: string
  client_phone: string
  shipping_method: string
  notes?: string
  created_at: string
  items: OrderItem[]
  user_addresses?: {
    address_line_1: string
    address_line_2?: string
    city: string
    region: string
    zip_code: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.order_id as string
  const [order, setOrder] = useState<Order | null>(null)
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


  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-3xl mb-6">Cargando orden...</h1>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-3xl mb-6">Orden no encontrada</h1>
        <Link href="/" className="text-pink-600 underline">
          Volver a la tienda
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto p-6 mt-40">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          ¡Orden confirmada!
        </h1>
        <p className="text-gray-700">
          Hemos recibido tu orden #{order.order_number}. Te enviaremos un correo
          de confirmación a <strong>{order.client_email}</strong>
        </p>
      </div>

      {/* Resumen de la orden */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Resumen de tu orden</h2>
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Número de orden</p>
              <p className="font-semibold">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-semibold capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-semibold">
                {new Date(order.created_at).toLocaleDateString("es-CL")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-pink-600 text-xl">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(order.total)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Datos del cliente */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Datos de contacto</h2>
        <div className="bg-white border rounded-lg p-6">
          <p>
            <strong>Nombre:</strong> {order.client_name}
          </p>
          <p>
            <strong>Correo:</strong> {order.client_email}
          </p>
          <p>
            <strong>Teléfono:</strong> {order.client_phone}
          </p>
        </div>
      </section>

      {/* Dirección de envío */}
      {order.shipping_method === "delivery" && order.user_addresses && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Dirección de envío</h2>
          <div className="bg-white border rounded-lg p-6">
            <p>{order.user_addresses.address_line_1}</p>
            {order.user_addresses.address_line_2 && (
              <p>{order.user_addresses.address_line_2}</p>
            )}
            <p>
              {order.user_addresses.city}, {order.user_addresses.region}{" "}
              {order.user_addresses.zip_code}
            </p>
          </div>
        </section>
      )}

      {order.shipping_method === "retiro_loja" && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Método de envío</h2>
          <div className="bg-white border rounded-lg p-6">
            <p className="font-semibold">Retiro en local</p>
          </div>
        </section>
      )}

      {/* Productos */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Productos</h2>
        <div className="bg-white border rounded-lg divide-y">
          {order.items?.map((item) => (
            <div key={item.id} className="p-4 flex justify-between">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.size && `Talla: ${item.size} • `}
                  Cantidad: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-pink-600">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {order.notes && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Observaciones</h2>
          <div className="bg-white border rounded-lg p-6">
            <p>{order.notes}</p>
          </div>
        </section>
      )}

      <div className="flex gap-4">
        <Button asChild className="bg-pink-600 text-white">
          <Link href="/">Seguir comprando</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/mi-cuenta/pedidos">Ver mis pedidos</Link>
        </Button>
      </div>
    </main>
  )
}
