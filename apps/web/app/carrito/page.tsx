"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import Image from "next/image"
import { Button } from "@jess/ui/button"
import Link from "next/link"
import { createClient } from "@utils/supabase/client"

export default function CartPage() {
  const supabase = createClient()
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUserAndCart() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        setItems([])
        setTotal(0)
        setIsLoading(false)
        return
      }
      const res = await fetch(`/api/cart?userId=${user.id}`)
      const data = await res.json()
      setItems(data)
      setTotal(
        Array.isArray(data)
          ? data.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0)
          : 0
      )
      setIsLoading(false)
    }
    loadUserAndCart()
  }, [supabase])

  const removeItem = async (id: string) => {
    if (!user) return
    await fetch(`/api/cart?userId=${user.id}&productId=${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter(item => item.product_id !== id))
  }

  const clearCart = async () => {
    if (!user) return
    // Esto elimina todos los productos uno a uno (próximamente puedes crear un endpoint "vaciar carrito" custom)
    await Promise.all(items.map(item =>
      fetch(`/api/cart?userId=${user.id}&productId=${item.product_id}`, { method: "DELETE" })
    ))
    setItems([])
    setTotal(0)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando carrito...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 to-white">
      <Header />
      <main className=" mt-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold my-8">Tu carrito de compras</h1>
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-24">
              <p>Tu carrito está vacío.</p>
              <Link href="/" className="text-pink-600 underline text-sm mt-4 block">Ver productos</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                  <Image
                    src={item.product?.image || "/placeholder.svg"}
                    alt={item.product?.name || ""}
                    width={80}
                    height={80}
                    className="rounded bg-white border"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.product?.name}</div>
                    <div className="text-sm text-pink-600 font-bold">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                      }).format(item.product?.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-2">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-500"
                    >Eliminar</Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-6">
                <Button onClick={clearCart} variant="outline" className="text-red-600 border-red-300">Vaciar carrito</Button>
                <div className="text-xl font-bold text-pink-600">
                  Total: {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                  }).format(total)}
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-pink-600 text-white px-8 py-3 text-lg" asChild>
                  <Link href="/checkout">Proceder al pago</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
