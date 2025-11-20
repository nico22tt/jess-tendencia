"use client"

import { ProtectedRoute } from "@jess/shared/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Heart } from "lucide-react"
import { Product } from "@jess/shared/types/product"
const mockFavorites = [
  {
    id: "1",
    name: "Zapatillas Urbanas Blancas",
    price: 59990,
    image: "/white-sneakers-for-women.png",
    label: "Más vendido",
  },
  {
    id: "2",
    name: "Botas de Cuero Café",
    price: 129990,
    image: "/brown-leather-boots-for-women.png",
    label: "Nuevo",
  },
  {
    id: "3",
    name: "Jeans Skinny Azul",
    price: 45990,
    image: "/skinny-blue-jeans-for-women.png",
  },
  {
    id: "4",
    name: "Pantuflas Rosadas",
    price: 22990,
    image: "/pink-slippers-for-women.png",
    label: "Oferta",
  },
]

export default function FavoritosPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-8 w-8 text-pink-600" />
                <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
              </div>
              <p className="text-gray-600">Los productos que más te gustan</p>
            </div>

            {mockFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockFavorites.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />

                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes favoritos aún</h3>
                <p className="text-gray-500 mb-6">Explora nuestros productos y guarda los que más te gusten</p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Explorar productos
                </a>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
