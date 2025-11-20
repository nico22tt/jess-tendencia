"use client"

import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@jess/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@jess/ui/sheet"
import { useCart } from "@jess/shared/contexts/cart"
import Image from "next/image"
import Link from "next/link"


export function CartSheet() {
  const { items, totalItems, subtotal, total, updateQuantity, removeItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-white text-xs font-semibold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-white">
        <SheetHeader className="border-b border-gray-200 pb-4">
          <SheetTitle className="text-xl font-semibold text-gray-900 px-5">Tu Carrito de Compras</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6 mx-1 px-2.5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm">Agrega productos para comenzar tu compra</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200 px-4 mx-7">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">{item.name}</h3>
                        {item.size && <p className="text-xs text-gray-500 mb-2">Talla: {item.size}</p>}
                        <p className="text-sm font-semibold text-pink-600">{formatPrice(item.price)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-md border-gray-300 bg-transparent"
                            onClick={() => updateQuantity(`${item.id}-${item.size}`, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium text-gray-700 w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-md border-gray-300 bg-transparent"
                            onClick={() => updateQuantity(`${item.id}-${item.size}`, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
                        onClick={() => removeItem(`${item.id}-${item.size}`)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 pt-4 pb-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mx-7 px-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold mx-7 px-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-pink-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white font-medium text-base rounded-lg my-2.5 py-6 px-0.5 mx-11 w-[83%]">
                  Proceder al Pago
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
