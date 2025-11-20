"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@jess/ui/button"
import { Card, CardContent } from "@jess/ui/card"
import { Badge } from "@jess/ui/badge"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { useCart } from "@jess/shared/contexts/cart"
import dynamic from "next/dynamic"
import type { Product } from "@jess/shared/types/product"

interface ProductCardProps {
  product: Product
  category?: string
  
}

const QuickViewModal = dynamic(() => import("@/components/quick-view-modal").then((mod) => mod.QuickViewModal), {
  ssr: false,
})

export function ProductCard({ product, category = "zapatillas" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [showQuickView, setShowQuickView] = useState(false)
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
  }

  const renderStars = () => {
    const rating = product.rating || 0
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>,
      )
    }
    return stars
  }

  return (
    <>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link href={`/${category}/${product.id}`}>
            <div className="aspect-square relative bg-gray-50">
              <Image
                src={
                  isHovered && product.images && product.images.length > 1
                    ? product.images[1]
                    : product.image || "/placeholder.svg"
                }
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-500"
              />

              {product.discount && (
                <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white font-bold">
                  -{product.discount}%
                </Badge>
              )}

              {/* Product Label */}
              {product.label && !product.discount && (
                <Badge
                  className={`absolute top-3 left-3 ${
                    product.labelType === "new" ? "bg-pink-500 hover:bg-pink-600" : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                >
                  {product.label}
                </Badge>
              )}

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-4 w-4" />
              </Button>

              {isHovered && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300">
                  <Button
                    variant="secondary"
                    className="bg-white hover:bg-gray-100 text-gray-900 gap-2"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowQuickView(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </Button>
                </div>
              )}
            </div>
          </Link>
        </div>

        <CardContent className="p-4">
          <Link href={`/${category}/${product.id}`}>
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mb-3 text-sm">
            {renderStars()}
            <span className="text-gray-500 ml-1">({product.reviewCount || 0})</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              </>
            )}
          </div>

          {product.variants && product.variants.length > 1 && (
            <div className="flex gap-2 mb-3">
              {product.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedVariant(index)
                  }}
                  className={`w-10 h-10 rounded-md border-2 overflow-hidden transition-all ${
                    selectedVariant === index ? "border-pink-500 scale-110" : "border-gray-200 hover:border-gray-300"
                  }`}
                  title={variant.color}
                >
                  <Image
                    src={variant.image || "/placeholder.svg"}
                    alt={variant.color}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            className="w-full bg-white hover:bg-gray-50 text-pink-600 border-2 border-pink-600 hover:border-pink-700 gap-2 font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            Agregar al carro
          </Button>
        </CardContent>
      </Card>

      {showQuickView && (
        <QuickViewModal product={product} category={category} open={showQuickView} onOpenChange={setShowQuickView} />
      )}
    </>
  )
}
