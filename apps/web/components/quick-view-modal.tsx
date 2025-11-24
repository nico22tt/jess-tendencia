"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogClose } from "@jess/ui/dialog"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { ShoppingCart, X, ExternalLink, Image as ImageIcon } from "lucide-react"
import { useCart } from "@jess/shared/contexts/cart"
import type { Product } from "@jess/shared/types/product"

interface QuickViewModalProps {
  product: Product
  category?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickViewModal({
  product,
  category = "zapatillas",
  open,
  onOpenChange,
}: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const { addItem } = useCart()

  // Filtra solo strings no vacíos ni nulos
  const allImages =
    Array.isArray(product.images)
      ? product.images.filter((img) => typeof img === "string" && img.trim())
      : []

  // Incluye product.image solo si es string válida y no está ya repetida
  if (
    typeof product.image === "string" &&
    product.image.trim() &&
    !allImages.includes(product.image)
  ) {
    allImages.unshift(product.image)
  }

  // Siempre hay al menos un string seguro:
  const safeImage =
    (allImages[selectedImage] && typeof allImages[selectedImage] === "string" && allImages[selectedImage].trim()) ?
    allImages[selectedImage] : "/placeholder.svg"

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(typeof price === "number" ? price / 100 : 0)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: typeof product.price === "number" ? product.price : 0,
      image: safeImage,
      quantity: 1,
    })
  }

  const sizes = ["35", "36", "37", "38", "39", "40", "41", "42"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 bg-white overflow-hidden" showCloseButton={false}>
        <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none bg-white/80 hover:bg-white p-1">
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-h-[90vh] overflow-y-auto">
          {/* Gallery */}
          <div className="p-6 bg-gray-50">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden mb-4">
              {safeImage ? (
                <Image
                  src={safeImage}
                  alt={product.name}
                  fill
                  className="object-cover"
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
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`aspect-square relative rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-pink-500 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedImage(index)}
                    title={`Imagen ${index + 1}`}
                  >
                    <Image
                      src={(typeof img === "string" && img.trim()) ? img : "/placeholder.svg"}
                      alt={`Vista ${index + 1} de ${product.name}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h2>
                <p className="text-sm text-gray-600">Vendido por {product.seller || "Jess Tendencia"}</p>
              </div>
              <Link
                href={`/${category}/${product.id}`}
                className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium whitespace-nowrap"
                onClick={() => onOpenChange(false)}
              >
                Mostrar detalles
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            {product.sku && (
              <p className="text-sm text-gray-500 mb-4">
                SKU: <span className="font-mono">{product.sku}</span>
              </p>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-pink-600">{formatPrice(product.price as number)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  {product.discount && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold">-{product.discount}%</Badge>
                  )}
                </>
              )}
            </div>

            {/* Color Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`aspect-square relative rounded-md overflow-hidden border-2 transition-all ${
                        selectedVariant === index
                          ? "border-pink-500 scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      title={variant.color}
                    >
                      <Image
                        src={typeof variant.image === "string" && variant.image.trim() ? variant.image : "/placeholder.svg"}
                        alt={variant.color}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Talla</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elige tu talla" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      Talla {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2 font-semibold py-6 text-lg mt-auto"
            >
              <ShoppingCart className="h-5 w-5" />
              Agregar al carro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
