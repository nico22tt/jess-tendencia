import { useEffect, useState } from "react"

type CartItem = {
  product_id: string
  quantity: number
  size?: string | null
  products: any
}

function getCartItemPrice(p: any): number {
  if (typeof p?.salePrice === "number" && p.salePrice > 0) return p.salePrice
  if (typeof p?.basePrice === "number") return p.basePrice
  return typeof p?.price === "number" ? p.price : 0
}

export function useCheckoutCart(userId?: string) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function loadCart() {
      setLoading(true)
      const res = await fetch(`/api/cart?userId=${userId}`)
      const data = await res.json()
      const safeItems: CartItem[] = Array.isArray(data) ? data : []
      setItems(safeItems)
      setTotal(
        safeItems.reduce(
          (sum, i) =>
            sum + getCartItemPrice(i.products) * (i.quantity || 1),
          0,
        ),
      )
      setLoading(false)
    }

    loadCart()
  }, [userId])

  return { items, total, loading, getCartItemPrice }
}
