import { CategoryPageLayout } from "@/components/category-page-layout"
import { Button } 

from "@jess/ui/button"
import { Card, CardContent } 

from "@jess/ui/card"
import { Badge } 

from "@jess/ui/badge"
import { Heart, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

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
}

function getProduct(id: string): Product | null {
  const products: Product[] = [
    {
      id: 1,
      name: "Botas Altas Negras",
      price: 89990,
      description:
        "Botas altas de cuero genuino con diseño elegante y versátil. Perfectas para looks sofisticados y casuales.",
      images: ["/black-high-boots-for-women.png", "/placeholder.svg"],
      sizes: [36, 37, 38, 39, 40],
      stock: 12,
      label: "Nuevo",
      labelType: "new",
    },
    {
      id: 2,
      name: "Botas Marrones Cuero",
      price: 95990,
      description: "Botas de cuero marrón con acabado premium y comodidad excepcional.",
      images: ["/brown-leather-boots-for-women.png", "/placeholder.svg"],
      sizes: [36, 37, 38, 39, 40],
      stock: 8,
      label: "Bestseller",
    },
  ]

  return products.find((p) => p.id === Number.parseInt(id)) || null
}

interface ProductPageProps {
  params: { id: string }
}

export default function BootProductPage({ params }: ProductPageProps) {
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

  return (
    <CategoryPageLayout title={product.name} description="Detalles del producto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Product Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square relative bg-gray-50">
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              {/* Product Label */}
              {product.label && (
                <Badge
                  className={`absolute top-4 left-4 ${
                    product.labelType === "new" ? "bg-pink-500" : "bg-red-500"
                  } text-white`}
                >
                  {product.label}
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.8) • 24 reseñas</span>
            </div>
            <p className="text-2xl font-bold text-pink-600 mb-4">{formatPrice(product.price)}</p>
          </div>

          <div>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Talla</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
              <option value="">Selecciona una talla</option>
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Info */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg font-medium"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Agregar al carrito
            </Button>
            <Button
              variant="outline"
              className="w-full py-3 border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
            >
              <Heart className="h-5 w-5 mr-2" />
              Agregar a favoritos
            </Button>
          </div>

          {/* Additional Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Envío gratis</span>
                  <span>En compras sobre $50.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Devoluciones</span>
                  <span>30 días</span>
                </div>
                <div className="flex justify-between">
                  <span>Garantía</span>
                  <span>6 meses</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CategoryPageLayout>
  )
}
