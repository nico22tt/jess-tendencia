"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@jess/ui/accordion"
import { Heart, ShoppingCart, Star, Minus, Plus, Truck, RotateCcw, Shield } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { Product } from "@jess/shared/types/product"
import { createClient } from "@utils/supabase/client"

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

type ParamsPromise = Promise<{ id: string }>
type Params = { id: string }
type Props = { params: Params } | { params: ParamsPromise }

// Helper para obtener stock por talla
function getStockBySize(product: Product, size: string): number | null {
  if (product.product_variants && Array.isArray(product.product_variants)) {
    const match = product.product_variants.find(
      (v: any) => v.size && v.size.toString() === size.toString()
    )
    return match?.stock ?? null
  }
  if (product.stock !== undefined) return product.stock
  return null
}

export default function JeansProductPage(props: Props) {
  const paramsObj: Params =
    typeof (props.params as any)?.then === "function"
      ? use(props.params as ParamsPromise)
      : (props.params as Params)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetch(`/api/products/${paramsObj.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No existe el producto")
        return res.json()
      })
      .then((data) => {
        setProduct(data.data)
        if (data.data?.category?.slug) {
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
  }, [paramsObj.id, router])

  if (!product) return <div className="py-24 text-center text-lg">Cargando producto...</div>

  const allImages = Array.isArray(product.images)
    ? product.images.filter((img) => typeof img === "string" && img.trim())
    : []
  if (
    typeof product.image === "string" &&
    product.image.trim() &&
    !allImages.includes(product.image)
  ) {
    allImages.unshift(product.image)
  }
  if (!allImages.length) allImages.push("/placeholder.svg")

  // Tallas dinámicas
  let sizes: string[] = []
  if (product.product_variants && product.product_variants.length) {
    sizes = Array.from(
      new Set(
        product.product_variants
          .map((v: any) => v.size)
          .filter(Boolean)
      )
    )
  } else if (product.sizes && product.sizes.length) {
    sizes = product.sizes.filter(Boolean)
  } else {
    sizes = ["34", "36", "38", "40", "42"]
  }

  const showSizeSelector =
    sizes.length > 0 && !sizes.every((t: string) => t.toLowerCase().includes("único"))

  const handleAddToCart = async () => {
    if (showSizeSelector && !selectedSize) {
      alert("Por favor selecciona una talla")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        productId: product.id,
        quantity,
      }),
    })

    if (!res.ok) {
      console.error("Error al agregar al carrito")
      return
    }

    // opcional: router.push("/carrito")
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
                <span className="text-sm text-gray-600 font-medium">4.5/5.0 (127 opiniones)</span>
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

            {/* Colores/variantes */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Color</label>
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

            {/* Selector de talla */}
            {showSizeSelector && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Talla</label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size: string) => {
                    const stock = getStockBySize(product, size)
                    const outOfStock = stock !== null && stock <= 0

                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        className={`px-4 py-2 border-2 rounded-md transition-all relative group
                          ${
                            selectedSize === size && !outOfStock
                              ? "border-pink-500 bg-pink-50"
                              : outOfStock
                              ? "border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        disabled={outOfStock}
                        title={outOfStock ? "Sin stock" : undefined}
                      >
                        {size}
                        {outOfStock && (
                          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                            Sin stock
                          </span>
                        )}
                      </button>
                    )
                  })}
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
                disabled={
                  showSizeSelector &&
                  (selectedSize === "" ||
                    (getStockBySize(product, selectedSize) ?? 0) <= 0)
                }
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

        {/* Descripción, detalles y guía de tallas */}
        <div className="mb-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-semibold">
                Descripción Completa
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description || "Descripción no disponible."}
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sizeguide">
              <AccordionTrigger className="text-lg font-semibold">
                Guía de Tallas
              </AccordionTrigger>
              <AccordionContent>
                {product.category?.name?.toLowerCase() === "jeans" ? (
                  <>
                    <div className="mb-4">
                      <div className="font-bold text-base mb-2">Guía de tallas de jeans</div>
                      <table className="w-full text-sm text-left text-gray-700 mb-4 border-collapse">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2">TALLA</th>
                            <th className="px-4 py-2">CINTURA (CM)</th>
                            <th className="px-4 py-2">CADERA (CM)</th>
                            <th className="px-4 py-2">MUSLO (CM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="px-4 py-2">36</td><td className="px-4 py-2">64-68</td><td className="px-4 py-2">94-98</td><td className="px-4 py-2">55-58</td></tr>
                          <tr><td className="px-4 py-2">38</td><td className="px-4 py-2">68-70</td><td className="px-4 py-2">98-100</td><td className="px-4 py-2">57-60</td></tr>
                          <tr><td className="px-4 py-2">40</td><td className="px-4 py-2">70-72</td><td className="px-4 py-2">100-102</td><td className="px-4 py-2">58-61</td></tr>
                          <tr><td className="px-4 py-2">42</td><td className="px-4 py-2">72-74</td><td className="px-4 py-2">102-104</td><td className="px-4 py-2">60-62</td></tr>
                          <tr><td className="px-4 py-2">44</td><td className="px-4 py-2">74-78</td><td className="px-4 py-2">104-108</td><td className="px-4 py-2">61-64</td></tr>
                          <tr><td className="px-4 py-2">46</td><td className="px-4 py-2">78-82</td><td className="px-4 py-2">108-112</td><td className="px-4 py-2">63-66</td></tr>
                          <tr><td className="px-4 py-2">48</td><td className="px-4 py-2">82-86</td><td className="px-4 py-2">112-118</td><td className="px-4 py-2">66-69</td></tr>
                          <tr><td className="px-4 py-2">50</td><td className="px-4 py-2">86-94</td><td className="px-4 py-2">118-126</td><td className="px-4 py-2">69-72</td></tr>
                          <tr><td className="px-4 py-2">52</td><td className="px-4 py-2">94-100</td><td className="px-4 py-2">126-132</td><td className="px-4 py-2">72-73</td></tr>
                          <tr><td className="px-4 py-2">54</td><td className="px-4 py-2">100-108</td><td className="px-4 py-2">134-138</td><td className="px-4 py-2">76-77</td></tr>
                        </tbody>
                      </table>
                      <div className="text-xs text-gray-500 bg-gray-50 border rounded px-3 py-2 mb-3">
                        Ten en cuenta que esta es una tabla referencial y puede variar levemente según el modelo o material.
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      {/* Puedes quitar esta imagen si no la usas */}
                      {/* <img
                        src="/guia-medidas-americanino.png"
                        alt="Referencia de medidas"
                        className="w-48 border rounded bg-white mb-4 md:mb-0"
                        style={{ maxWidth: "180px" }}
                      /> */}
                      <div>
                        <div className="font-bold mb-1">Cómo tomar tus medidas:</div>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                          <li><strong>Cintura:</strong> Mide alrededor de la parte más estrecha del torso.</li>
                          <li><strong>Cadera:</strong> Mide el contorno más ancho de la cadera/pelvis.</li>
                          <li><strong>Muslo:</strong> Mide la parte más ancha del muslo.</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Este producto no requiere guía de tallas.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="details">
              <AccordionTrigger className="text-lg font-semibold">
                Detalles del producto
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>SKU:</strong> {product.sku}</li>
                  {product.brand && <li><strong>Marca:</strong> {product.brand}</li>}
                  {product.category?.name && <li><strong>Categoría:</strong> {product.category.name}</li>}
                  {product.stock !== undefined && (
                    <li><strong>Stock disponible:</strong> {product.stock} unidades</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <ProductCarousel
            products={relatedProducts}
            category="jeans"
            title="Productos Relacionados"
          />
        )}
      </div>
    </main>
  )
}
