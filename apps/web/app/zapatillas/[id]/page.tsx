"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@jess/ui/accordion"
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react"
import Image from "next/image"
import { useCart } from "@jess/shared/contexts/cart"
import dynamic from "next/dynamic"
import type { Product } from "@jess/shared/types/product"

const ProductCarousel = dynamic(
  () => import("@/components/product-carousel").then((mod) => ({ default: mod.ProductCarousel })),
  { ssr: false }
)

// Helpers precio
const getDisplayPrice = (product: Product): number => {
  if (typeof product.salePrice === "number" && product.salePrice > 0) return product.salePrice
  if (typeof product.basePrice === "number") return product.basePrice
  return typeof product.price === "number" ? product.price : 0
}
const getOriginalPrice = (product: Product): number | undefined => {
  if (typeof product.basePrice === "number" && typeof product.salePrice === "number" && product.salePrice > 0)
    return product.basePrice
  return product.originalPrice
}
const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price / 100)

// Patrones compatibilidad Next.js 15+
type ParamsPromise = Promise<{ id: string }>
type Params = { id: string }
type Props = { params: Params } | { params: ParamsPromise }

export default function ProductPage(props: Props) {
  // Unwrap params si es Promise (Next.js 15)
  const paramsObj: Params =
    typeof (props.params as any)?.then === "function"
      ? use(props.params as ParamsPromise)
      : (props.params as Params)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const { addItem } = useCart()
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/products/${paramsObj.id}`)
      .then(res => {
        if (!res.ok) throw new Error("No existe el producto")
        return res.json()
      })
      .then(data => setProduct(data.data))
      .catch(() => router.replace("/404"))
  }, [paramsObj.id, router])

  if (!product) return <div className="py-24 text-center text-lg">Cargando producto...</div>

  // Limpieza y fallback para imágenes
  const allImages = Array.isArray(product.images)
    ? product.images.filter(img => typeof img === "string" && img.trim())
    : []
  if (
    typeof product.image === "string" &&
    product.image.trim() &&
    !allImages.includes(product.image)
  ) {
    allImages.unshift(product.image)
  }
  if (!allImages.length) allImages.push("/placeholder.svg")
  const sizes = product.sizes ?? ["35", "36", "37", "38", "39", "40", "41", "42"]

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla")
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: getDisplayPrice(product),
      image: allImages[0] || "/placeholder.svg",
      quantity,
    })
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-36">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Gallery */}
          <div className="lg:col-span-3">
            <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden mb-4">
              <Image
                src={allImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.label && (
                <Badge
                  className={`absolute top-4 left-4 ${
                    product.labelType === "new" ? "bg-pink-500" : "bg-red-500"
                  } text-white font-bold`}
                >
                  {product.label}
                </Badge>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    title={`Imagen ${index + 1} de ${allImages.length}`}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-pink-500 scale-105" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={typeof img === "string" && img.trim() ? img : "/placeholder.svg"}
                      alt={`Vista ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">4.5/5.0 (127 opiniones)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-pink-600">{formatPrice(getDisplayPrice(product))}</span>
              {getOriginalPrice(product) && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(getOriginalPrice(product)!)}</span>
                  {product.discount && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold text-base px-3 py-1">
                      -{product.discount}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            {/* ...restante info panel, tallas, cantidad, botón agregar, etc... */}
          </div>
        </div>
        {/* ...acordeón descripción, guía de tallas, shipping/returns, carousel, etc... */}
      </div>
    </main>
  )
}
