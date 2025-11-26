"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@jess/ui/button"

export default function CheckoutSuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      const res = await fetch(`/api/orders/${params.id}`, { cache: 'no-store' })
      if (!res.ok) {
        setError("No se pudo cargar tu orden.")
        setLoading(false)
        return
      }
      const json = await res.json()
      if (!json.success) {
        setError(json.error || "No se pudo cargar la orden.")
      } else {
        setOrder(json.order)
      }
      setLoading(false)
    }
    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center text-xl">Cargando detalle del pedido...</div>
      </main>
    )
  }
  if (error || !order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-600 mb-8">{error || "No se encontró la orden."}</p>
        <Link href="/" className="text-pink-600 underline">Volver a inicio</Link>
      </main>
    )
  }

  // Producto por orden_items.product
  return (
    <main className="max-w-2xl mx-auto mt-12 p-4">
      <h1 className="text-3xl font-bold text-pink-600 mb-4 text-center">¡Compra realizada!</h1>
      <div className="mb-6 text-center">
        <div className="text-gray-700 mb-2">Gracias por tu compra. Tu orden fue registrada con éxito.</div>
        <div className="text-lg font-semibold">Nº Orden: <span className="text-pink-500">{order.order_number}</span></div>
        <div className="text-gray-500 text-sm mb-2">Estado: <span className="font-semibold">{order.status}</span></div>
      </div>

      <section className="mb-8 border rounded-lg overflow-hidden">
        <div className="bg-pink-50 px-4 py-2 font-semibold text-pink-700">Resumen de productos</div>
        <ul className="divide-y divide-gray-200">
          {order.order_items.map((item: any) => (
            <li className="flex items-center gap-3 py-2 px-4" key={item.id}>
              {item.product?.images?.[0] && (
                <Image src={typeof item.product.images[0] === "string" ? item.product.images[0] : "/placeholder.svg"} alt={item.product.name} width={48} height={48} className="rounded border bg-white object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.product?.name || "Producto"}</div>
                {item.size && <div className="text-xs text-gray-500">Talla: {item.size}</div>}
                <div className="text-xs text-gray-400">SKU: {item.product?.sku}</div>
              </div>
              <div className="text-sm font-medium text-gray-700 px-2">x{item.quantity}</div>
              <div className="text-pink-600 font-bold text-sm">
                {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(item.unit_price * item.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t px-4 py-2 flex flex-col gap-1">
          <div className="flex justify-between text-sm"><span>Subtotal</span> <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Envío</span> <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.shipping)}</span></div>
          <div className="flex justify-between text-sm"><span>Impuestos</span> <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.tax)}</span></div>
          <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total pagado</span> <span className="text-pink-600">{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.total)}</span></div>
        </div>
      </section>
      <section className="mb-8 border rounded-lg overflow-hidden">
        <div className="bg-pink-50 px-4 py-2 font-semibold text-pink-700">Datos de envío</div>
        <div className="px-4 py-2 text-sm">
          <div><span className="font-medium">Destinatario: </span>{order.shipping_name}</div>
          <div><span className="font-medium">Dirección: </span>{order.shipping_address}, {order.shipping_city}, {order.shipping_region} {order.shipping_zip}</div>
          <div><span className="font-medium">Teléfono: </span>{order.shipping_phone}</div>
          <div><span className="font-medium">Email: </span>{order.shipping_email}</div>
        </div>
      </section>
      <div className="flex justify-center">
        <Button asChild className="bg-pink-600 text-white px-8 py-2 mt-2">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </main>
  )
}
