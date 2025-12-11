"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@jess/ui/accordion"
import { Heart, ShoppingCart, Star, Minus, Plus, Truck, RotateCcw, Shield } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { createClient } from "@utils/supabase/client"
import type { Product } from "@jess/shared/types/product"

const ProductCarousel = dynamic(
  () => import("@/components/product-carousel").then((mod) => ({ default: mod.ProductCarousel })),
  { ssr: false }
)

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
  }).format(price)

// ✅ NUEVA FUNCIÓN: Maneja imágenes como strings u objetos
const parseProductImages = (product: Product): string[] => {
  const images: any = product?.images
  let arr: Array<string | { url: string; isMain?: boolean }> = []

  // Si es un array
  if (Array.isArray(images)) {
    // Si son strings directos
    if (typeof images[0] === "string") {
      arr = images.filter((img) => typeof img === "string" && img.trim())
    } else {
      // Si son objetos con url
      arr = images
    }
  } 
  // Si es un string JSON, parsearlo
  else if (typeof images === "string" && images.trim()) {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) arr = parsed
    } catch {
      arr = []
    }
  } 
  // Si es un objeto único
  else if (images && typeof images === "object") {
    arr = [images]
  }

  // Convertir todo a strings
  const urlStrings = arr
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter((url): url is string => !!url && url.trim() !== "")

  // Agregar imagen principal si existe y no está en el array
  if (typeof product.image === "string" && product.image.trim() && !urlStrings.includes(product.image)) {
    urlStrings.unshift(product.image)
  }

  // Fallback si no hay imágenes
  return urlStrings.length > 0 ? urlStrings : ["/placeholder.svg"]
}

type ParamsPromise = Promise<{ id: string }>
type Params = { id: string }
type Props = { params: Params } | { params: ParamsPromise }

export default function AccesorioPage(props: Props) {
  const supabase = createClient()
  const paramsObj: Params =
    typeof (props.params as any)?.then === "function"
      ? use(props.params as ParamsPromise)
      : (props.params as Params)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // ✅ Cargar usuario
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    fetch(`/api/products/${paramsObj.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No existe el producto")
        return res.json()
      })
      .then((data) => {
        setProduct(data.data)
        if (data.data?.category?.id) {
          fetch(`/api/products?categorySlug=${data.data.category.slug}`)
            .then((res) => res.json())
            .then((related) => {
              const filtered = (related.data || [])
                .filter((p: Product) => p.id !== data.data.id)
                .slice(0, 8)
              setRelatedProducts(filtered)
            })
        }
      })
      .catch(() => router.replace("/404"))
  }, [paramsObj.id, router, supabase])

  // ✅ FUNCIÓN CORREGIDA: Agregar al carrito
  const handleAddToCart = async () => {
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito")
      router.push("/login")
      return
    }

    if (!product) return

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          quantity: quantity,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al agregar al carrito")
      }

      alert("✅ Producto agregado al carrito")
      router.push("/cart")
    } catch (error: any) {
      console.error("Error al agregar al carrito:", error)
      alert(`❌ ${error.message}`)
    }
  }

  if (!product) return <div className="py-24 text-center text-lg">Cargando producto...</div>

  // ✅ USA LA NUEVA FUNCIÓN
  const allImages = parseProductImages(product)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-36">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Gallery */}
          <div className="lg:col-span-3">
            <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden mb-4">
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
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
                      selectedImage === index
                        ? "border-pink-500 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
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
              {product.brand && (
                <p className="text-sm text-gray-600 mb-3">
                  Marca: <span className="font-semibold">{product.brand}</span>
                </p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  4.5/5.0 (127 opiniones)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-pink-600">
                {formatPrice(getDisplayPrice(product))}
              </span>
              {getOriginalPrice(product) && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(getOriginalPrice(product)!)}
                  </span>
                  {product.discount && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold text-base px-3 py-1">
                      -{product.discount}%
                    </Badge>
                  )}
                </>
              )}
            </div>

            {/* Variantes */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.product_variants.map((variant: any, index: number) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`px-4 py-2 border-2 rounded-md transition-all ${
                        selectedVariant === index
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      title={variant.color || `Variante ${index + 1}`}
                    >
                      {variant.color || `Opción ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad y botones */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Cantidad:</label>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                    title="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                    title="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2 font-semibold py-6 text-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                Agregar al carro
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 py-6 text-lg border-pink-600 text-pink-600 hover:bg-pink-50"
              >
                <Heart className="h-5 w-5" />
                Agregar a favoritos
              </Button>
            </div>

            {/* Beneficios */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-pink-600" />
                <span>Envío gratis en compras sobre $50.000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-5 w-5 text-pink-600" />
                <span>Devoluciones gratis hasta 30 días</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-pink-600" />
                <span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-semibold">
                Descripción
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  {product.description || "Descripción no disponible."}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="details">
              <AccordionTrigger className="text-lg font-semibold">
                Detalles del producto
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>SKU:</strong> {product.sku}
                  </li>
                  <li>
                    <strong>Marca:</strong> {product.brand}
                  </li>
                  <li>
                    <strong>Categoría:</strong> {product.category?.name}
                  </li>
                  {product.stock !== undefined && (
                    <li>
                      <strong>Stock disponible:</strong> {product.stock} unidades
                    </li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
            <ProductCarousel products={relatedProducts} category="accesorios" />
          </div>
        )}
      </div>
    </main>
  )
}
