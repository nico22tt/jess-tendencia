"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@jess/ui/button"
import { Card, CardContent } from "@jess/ui/card"
import { Badge } from "@jess/ui/badge"
import { Heart, ShoppingCart, Eye, Image as ImageIcon } from "lucide-react"
import { useCart } from "@jess/shared/contexts/cart"
import dynamic from "next/dynamic"
import type { Product } from "@jess/shared/types/product"

interface ProductCardProps {
  product: Product
  category?: string
}

const QuickViewModal = dynamic(
  () => import("@/components/quick-view-modal").then((mod) => mod.QuickViewModal),
  { ssr: false }
)

export function ProductCard({ product, category = "zapatillas" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [showQuickView, setShowQuickView] = useState(false)
  const { addItem } = useCart()

  const getDisplayPrice = (): number => {
    if (typeof product.salePrice === "number" && product.salePrice > 0) return product.salePrice
    if (typeof product.basePrice === "number") return product.basePrice
    return typeof product.price === "number" ? product.price : 0
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price / 100)

  // Soporta:
  // - images: Array<{ url, isMain }>
  // - images: string[] (legacy)
  // - images: string JSON
  // - images: objeto único
  const getImageSrc = (): string => {
    const images: any = (product as any).images

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
        if (Array.isArray(parsed)) {
          arr = parsed
        }
      } catch {
        arr = []
      }
    } else if (images && typeof images === "object") {
      arr = [images]
    }

    const mainImg = arr.find((img) => img.isMain && img.url)
    // Si está hover y hay al menos 2 imágenes, usa la segunda como hover image
    if (isHovered && arr[1]?.url) {
      return arr[1].url
    }

    return mainImg?.url || arr[0]?.url || (typeof (product as any).image === "string" && (product as any).image) || "/placeholder.svg"
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: getDisplayPrice(),
      image: getImageSrc(),
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
        </span>
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
              {getImageSrc() ? (
                <Image
                  src={getImageSrc()}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-500"
                  priority={false}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                  <span className="ml-2 text-gray-400 text-sm">Sin imagen</span>
                </div>
              )}

              {product.discount && (
                <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white font-bold">
                  -{product.discount}%
                </Badge>
              )}

              {product.label && !product.discount && (
                <Badge
                  className={`absolute top-3 left-3 ${
                    product.labelType === "new"
                      ? "bg-pink-500 hover:bg-pink-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                >
                  {product.label}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.preventDefault()}
                title="Agregar a favoritos"
                aria-label="Agregar a favoritos"
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
            <span className="text-xl font-bold text-pink-600">{formatPrice(getDisplayPrice())}</span>
            {typeof product.basePrice === "number" &&
              typeof product.salePrice === "number" &&
              product.salePrice > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.basePrice)}
                </span>
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
                    selectedVariant === index
                      ? "border-pink-500 scale-110"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  title={variant.color || "Variante"}
                  aria-label={variant.color || "Variante"}
                >
                  <Image
                    src={
                      typeof variant.image === "string" && variant.image.trim()
                        ? variant.image
                        : "/placeholder.svg"
                    }
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
        <QuickViewModal
          product={product}
          category={category}
          open={showQuickView}
          onOpenChange={setShowQuickView}
        />
      )}
    </>
  )
}
