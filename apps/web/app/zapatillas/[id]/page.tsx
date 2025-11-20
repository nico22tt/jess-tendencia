"use client"

import { useState } from "react"
import { Button } 

from "@jess/ui/button"
import { Badge } 

from "@jess/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } 

from "@jess/ui/accordion"
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { useCart } 

from "@jess/shared/contexts/cart"



import dynamic from "next/dynamic"

const ProductCarousel = dynamic(
  () => import("@/components/product-carousel").then((mod) => ({ default: mod.ProductCarousel })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-none w-64 h-96 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    ),
  },
)

interface Product {
  id: number
  name: string
  price: number
  description: string
  images: string[]
  sizes: number[]
  stock: number
  label?: string
  labelType?: "new" | "sale"
  originalPrice?: number
  discount?: number
}

// Mock function - replace with real data fetching
function getProduct(id: string): Product | null {
  const products: Product[] = [
    {
      id: 1,
      name: "Zapatillas Deportivas Blancas",
      price: 89990,
      description:
        "Zapatillas deportivas de alta calidad con diseño moderno y cómodo. Perfectas para el uso diario y actividades deportivas.",
      images: ["/white-sneakers-for-women.png", "/placeholder.svg"],
      sizes: [35, 36, 37, 38, 39, 40, 41, 42],
      stock: 15,
      label: "Nuevo",
      labelType: "new",
      originalPrice: 99990,
      discount: 10,
    },
    {
      id: 2,
      name: "Zapatillas Casuales Rosa",
      price: 79990,
      description: "Zapatillas casuales en tono rosa suave, ideales para looks relajados y modernos.",
      images: ["/pink-casual-sneakers-for-women.png", "/placeholder.svg"],
      sizes: [35, 36, 37, 38, 39, 40, 41, 42],
      stock: 8,
    },
    // Add more mock products as needed
  ]

  return products.find((p) => p.id === Number.parseInt(id)) || null
}

interface ProductPageProps {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const product = getProduct(params.id)

  if (!product) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla")
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
    })
  }

  const allImages = product.images || ["/placeholder.svg"]
  const sizes = ["35", "36", "37", "38", "39", "40", "41", "42"]
  const colors = [
    { id: 1, name: "Blanco", image: "/white-sneakers-for-women.png" },
    { id: 2, name: "Rosa", image: "/pink-casual-sneakers-for-women.png" },
    { id: 3, name: "Negro", image: "/black-running-sneakers-for-women.png" },
  ]

  const relatedProducts = [
    {
      id: 3,
      name: "Zapatillas Running Negras",
      price: 94990,
      originalPrice: 119990,
      discount: 20,
      image: "/black-running-sneakers-for-women.png",
      images: ["/black-running-sneakers-for-women.png", "/placeholder.svg"],
      rating: 5,
      reviewCount: 89,
      variants: [
        { id: 1, image: "/black-running-sneakers-for-women.png", color: "Negro" },
        { id: 2, image: "/white-sneakers-for-women.png", color: "Blanco" },
      ],
    },
    {
      id: 4,
      name: "Zapatillas Urbanas Grises",
      price: 69990,
      image: "/gray-urban-sneakers-for-women.png",
      rating: 4,
      reviewCount: 56,
      label: "Nuevo",
      labelType: "new" as const,
    },
    {
      id: 5,
      name: "Zapatillas Deportivas Azules",
      price: 84990,
      originalPrice: 99990,
      discount: 15,
      image: "/blue-sport-sneakers-for-women.png",
      rating: 5,
      reviewCount: 124,
    },
    {
      id: 6,
      name: "Zapatillas Casuales Beige",
      price: 74990,
      image: "/beige-casual-sneakers-for-women.png",
      rating: 4,
      reviewCount: 67,
    },
    {
      id: 7,
      name: "Zapatillas Training Rosa",
      price: 89990,
      originalPrice: 109990,
      discount: 18,
      image: "/pink-training-sneakers-for-women.png",
      rating: 5,
      reviewCount: 98,
    },
    {
      id: 8,
      name: "Zapatillas Lifestyle Blancas",
      price: 79990,
      image: "/white-lifestyle-sneakers-for-women.png",
      rating: 4,
      reviewCount: 73,
      label: "Nuevo",
      labelType: "new" as const,
    },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => `https://jesstendencia.cl${img}`),
    description: product.description,
    sku: `PROD-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Jess Tendencia",
    },
    offers: {
      "@type": "Offer",
      url: `https://jesstendencia.cl/zapatillas/${product.id}`,
      priceCurrency: "CLP",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Jess Tendencia",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "127",
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-36">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            {/* Left Column - Image Gallery (60% = 3 cols) */}
            <div className="lg:col-span-3">
              {/* Featured Image */}
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

              {/* Thumbnail Gallery - Vertical Column */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === index ? "border-pink-500 scale-105" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image src={img || "/placeholder.svg"} alt={`Vista ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Purchase Information (40% = 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Name */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                {/* Star Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">4.5/5.0 (127 opiniones)</span>
                </div>
              </div>

              {/* Prices and Discount */}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-pink-600">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    {product.discount && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold text-base px-3 py-1">
                        -{product.discount}%
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Color/Model Selector */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 block">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVariant === index
                          ? "border-pink-500 ring-2 ring-pink-200"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                      title={color.name}
                    >
                      <Image src={color.image || "/placeholder.svg"} alt={color.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector - Grid of Buttons */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 block">Talla</label>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Counter */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 block">Cantidad</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 border-gray-300"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold text-gray-900 w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12 border-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button - LARGE */}
              <Button
                onClick={handleAddToCart}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-3 font-bold py-7 text-xl"
              >
                <ShoppingCart className="h-6 w-6" />
                Agregar al Carrito
              </Button>

              {/* Add to Favorites */}
              <Button
                variant="outline"
                className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 gap-2 py-6 bg-transparent"
              >
                <Heart className="h-5 w-5" />
                Agregar a Favoritos
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {/* Description */}
              <AccordionItem value="description">
                <AccordionTrigger className="text-lg font-semibold">Descripción Completa</AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  <p>
                    Estas zapatillas están diseñadas con materiales de alta calidad que garantizan durabilidad y
                    comodidad durante todo el día. Su diseño moderno y versátil las hace perfectas para cualquier
                    ocasión, desde actividades deportivas hasta salidas casuales.
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Material exterior: Cuero sintético de alta calidad</li>
                    <li>Suela: Goma antideslizante</li>
                    <li>Interior: Acolchado suave para mayor comodidad</li>
                    <li>Cierre: Cordones ajustables</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Size Guide */}
              <AccordionItem value="size-guide">
                <AccordionTrigger className="text-lg font-semibold">Guía de Tallas</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Talla</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Longitud (cm)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Ancho (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-gray-700">35</td>
                          <td className="px-4 py-3 text-gray-600">22.5</td>
                          <td className="px-4 py-3 text-gray-600">8.5</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-700">36</td>
                          <td className="px-4 py-3 text-gray-600">23.0</td>
                          <td className="px-4 py-3 text-gray-600">8.7</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-700">37</td>
                          <td className="px-4 py-3 text-gray-600">23.5</td>
                          <td className="px-4 py-3 text-gray-600">8.9</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-700">38</td>
                          <td className="px-4 py-3 text-gray-600">24.0</td>
                          <td className="px-4 py-3 text-gray-600">9.1</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-700">39</td>
                          <td className="px-4 py-3 text-gray-600">24.5</td>
                          <td className="px-4 py-3 text-gray-600">9.3</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-700">40</td>
                          <td className="px-4 py-3 text-gray-600">25.0</td>
                          <td className="px-4 py-3 text-gray-600">9.5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Recomendamos medir tu pie y compararlo con la tabla para encontrar tu talla perfecta.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Shipping and Returns */}
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-lg font-semibold">Envío y Devoluciones</AccordionTrigger>
                <AccordionContent className="text-gray-600 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Envío</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Envío gratis en compras sobre $50.000</li>
                      <li>Despacho a todo Chile</li>
                      <li>Tiempo de entrega: 3-5 días hábiles en Santiago, 5-7 días en regiones</li>
                      <li>Seguimiento de pedido disponible</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Devoluciones</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>30 días para devoluciones sin costo</li>
                      <li>Producto debe estar sin uso y con etiquetas originales</li>
                      <li>Reembolso completo o cambio por otra talla/color</li>
                      <li>Proceso de devolución simple y rápido</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Garantía</h4>
                    <p>Todos nuestros productos cuentan con 6 meses de garantía contra defectos de fabricación.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <ProductCarousel products={relatedProducts} category="zapatillas" title="Productos Relacionados" />
        </div>
      </main>
    </>
  )
}
