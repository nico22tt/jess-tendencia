"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@jess/ui/button"
import { createClient } from "@utils/supabase/client"

const getFirstImageFromProduct = (product: any): string | null => {
  if (!product || !product.images) return null
  const images = product.images

  // Caso 1: array de strings
  if (Array.isArray(images) && typeof images[0] === "string") {
    return images[0]
  }

  // Caso 2: string JSON
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === "string") return parsed[0]
        if (parsed[0]?.url && typeof parsed[0].url === "string") return parsed[0].url
      }
    } catch {
      return null
    }
  }

  // Caso 3: array de objetos { url }
  if (Array.isArray(images) && images[0]?.url && typeof images[0].url === "string") {
    return images[0].url
  }

  return null
}

export default function CheckoutSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [clearingCart, setClearingCart] = useState(false)
  
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function init() {
      // Obtener usuario primero
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Luego cargar orden
      await fetchOrder()
    }

    init()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' })
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
      
      // ✅ LIMPIAR CARRITO AUTOMÁTICAMENTE DESPUÉS DE COMPRA EXITOSA
      if (user?.id) {
        setClearingCart(true)
        try {
          const clearRes = await fetch(`/api/cart?userId=${user.id}&action=clear`, {
            method: 'PATCH'
          })
          if (clearRes.ok) {
            console.log("✅ Carrito limpiado después de compra exitosa")
          }
        } catch (err) {
          console.error("Error limpiando carrito:", err)
        } finally {
          setClearingCart(false)
        }
      }
    }
    setLoading(false)
  }

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

  return (
    <main className="max-w-2xl mx-auto mt-0 p-4 pt-40">
      <h1 className="text-3xl font-bold text-pink-600 mb-4 text-center">¡Compra realizada!</h1>
      <div className="mb-6 text-center">
        <div className="text-gray-700 mb-2">Gracias por tu compra. Tu orden fue registrada con éxito.</div>
        <div className="text-lg font-semibold">Nº Orden: <span className="text-pink-500">{order.order_number}</span></div>
        <div className="text-gray-500 text-sm mb-2">
          Estado: <span className="font-semibold">{order.status}</span>
          {clearingCart && (
            <span className="ml-2 text-xs text-green-600 animate-pulse">Limpiando carrito...</span>
          )}
        </div>
      </div>

      <section className="mb-8 border rounded-lg overflow-hidden">
        <div className="bg-pink-50 px-4 py-2 font-semibold text-pink-700">Resumen de productos</div>
        <ul className="divide-y divide-gray-200">
          {order.order_items.map((item: any) => {
            const imageUrl = getFirstImageFromProduct(item.products)
            
            return (
              <li className="flex items-center gap-3 py-2 px-4" key={item.id}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.products?.name || "Producto"}
                    width={48}
                    height={48}
                    className="rounded border bg-white object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.products?.name || "Producto"}</div>
                  {item.size && <div className="text-xs text-gray-500">Talla: {item.size}</div>}
                  <div className="text-xs text-gray-400">SKU: {item.products?.sku || 'N/A'}</div>
                </div>
                <div className="text-sm font-medium text-gray-700 px-2 text-center">x{item.quantity}</div>
                <div className="text-pink-600 font-bold text-sm text-right min-w-[80px]">
                  {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(item.unit_price * item.quantity)}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="border-t px-4 py-2 flex flex-col gap-1 bg-gray-50">
          <div className="flex justify-between text-sm"><span>Subtotal</span> <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Envío</span> <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.shipping)}</span></div>
          <div className="flex justify-between text-sm"><span>Impuestos</span> <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.tax)}</span></div>
          <div className="flex justify-between text-base font-bold border-t pt-2">
            <span>Total pagado</span> 
            <span className="text-pink-600">{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(order.total)}</span>
          </div>
        </div>
      </section>
      
      <section className="mb-8 border rounded-lg overflow-hidden">
        <div className="bg-pink-50 px-4 py-2 font-semibold text-pink-700">Datos de envío</div>
        <div className="px-4 py-4 text-sm space-y-1">
          <div><span className="font-medium">Destinatario: </span>{order.shipping_name}</div>
          <div><span className="font-medium">Dirección: </span>{order.shipping_address}, {order.shipping_city}, {order.shipping_region} {order.shipping_zip}</div>
          <div><span className="font-medium">Teléfono: </span>{order.shipping_phone}</div>
          <div><span className="font-medium">Email: </span>{order.shipping_email}</div>
        </div>
      </section>
      
      <div className="flex justify-center">
        <Button asChild className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 mt-4 text-lg font-medium shadow-lg">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </main>
  )
}
