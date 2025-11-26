"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
  image: string
  size?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (uid: string) => void
  updateQuantity: (uid: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Inicializa el estado leyendo localStorage en el primer render
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("jess-tendencia-cart")
      return savedCart ? JSON.parse(savedCart) : []
    }
    return []
  })

  // Guarda el carrito en localStorage cada vez que cambian los items
  useEffect(() => {
    localStorage.setItem("jess-tendencia-cart", JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.id === item.id && i.size === item.size
      )
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prevItems, item]
    })
  }

  const removeItem = (uid: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => `${item.id}-${item.size}` !== uid)
    )
  }

  const updateQuantity = (uid: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(uid)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        `${item.id}-${item.size}` === uid ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal // Puedes agregar envíos, descuentos, impuestos aquí

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
