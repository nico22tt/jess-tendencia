"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import Image from "next/image"
import { Button } from "@jess/ui/button"
import Link from "next/link"
import { createClient } from "@utils/supabase/client"
import { RecommendationsCarousel } from "@/components/recommendations-carousel" // Ajusta la ruta

function getCartItemPrice(p: any): number {
  if (typeof p?.salePrice === "number" && p.salePrice > 0) return p.salePrice
  if (typeof p?.basePrice === "number") return p.basePrice
  return typeof p?.price === "number" ? p.price : 0
}

function getCartItemImage(p: any): string {
  const images: any = p?.images
  let arr: Array<{ url: string; isMain?: boolean }> = []

  if (Array.isArray(images)) {
    if (typeof images[0] === "string") {
      arr = images
        .filter((img) => typeof img === "string" && img.trim())
        .map((url) => ({ url, isMain: false }))
    } else {
      arr = images
    }
  } else if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) arr = parsed
    } catch {
      arr = []
    }
  } else if (images && typeof images === "object") {
    arr = [images]
  }

  const main = arr.find((img) => img.isMain && img.url)
  const fallback =
    (typeof p?.image === "string" && p.image) || "/placeholder.svg"

  if (!arr.length && !main) return fallback
  return main?.url || arr[0]?.url || fallback
}

export default function CartPage() {
  const supabase = createClient()
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUserAndCart() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setItems([])
        setTotal(0)
        setIsLoading(false)
        return
      }

      const res = await fetch(`/api/cart?userId=${user.id}`)
      const data = await res.json()

      const safeItems = Array.isArray(data) ? data : []
      setItems(safeItems)

      setTotal(
        safeItems.reduce(
          (sum, i) =>
            sum + getCartItemPrice(i.products) * (i.quantity || 1),
          0,
        ),
      )

      setIsLoading(false)
    }

    loadUserAndCart()
  }, [supabase])

  const removeItem = async (id: string) => {
    if (!user) return
    await fetch(`/api/cart?userId=${user.id}&productId=${id}`, {
      method: "DELETE",
    })
    setItems((prev) => prev.filter((item) => item.product_id !== id))

    const removed = items.find((i) => i.product_id === id)
    if (removed) {
      const price = getCartItemPrice(removed.products) * (removed.quantity || 1)
      setTotal((prev) => prev - price)
    }
  }

  const clearCart = async () => {
    if (!user) return
    await Promise.all(
      items.map((item) =>
        fetch(`/api/cart?userId=${user.id}&productId=${item.product_id}`, {
          method: "DELETE",
        }),
      ),
    )
    setItems([])
    setTotal(0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando carrito...
      </div>
    )
  }

  const hasItems = items.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 to-white">
      <Header />
      <main className="mt-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold my-8">Tu carrito de compras</h1>
          
          {hasItems ? (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center border-b pb-4"
                >
                  <Image
                    src={getCartItemImage(item.products)}
                    alt={item.products?.name || ""}
                    width={80}
                    height={80}
                    className="rounded bg-white border"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">
                      {item.products?.name || "Producto sin nombre"}
                    </div>
                    <div className="text-sm text-pink-600 font-bold">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                      }).format(getCartItemPrice(item.products))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-2">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-500"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-6">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="text-red-600 border-red-300"
                >
                  Vaciar carrito
                </Button>
                <div className="text-xl font-bold text-pink-600">
                  Total:{" "}
                  {new Intl.NumberFormat("es-CL", {
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
          ) : (
            <div className="text-center text-gray-500 py-24">
              <p>Tu carrito está vacío.</p>
              <Link
                href="/"
                className="text-pink-600 underline text-sm mt-4 block"
              >
                Ver productos
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Carousel de recomendaciones solo cuando hay productos en el carrito */}
      {hasItems && (
        <RecommendationsCarousel />
      )}
    </div>
  )
}
