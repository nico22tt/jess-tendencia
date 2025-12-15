"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Heart } from "lucide-react"
import type { Product } from "@jess/shared/types/product"
import { createClient } from "@utils/supabase/client"
import { useRouter } from "next/navigation"

export default function FavoritosPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/favorites?userId=${user.id}`)
        const data = await res.json()
        const items = Array.isArray(data) ? data : []
        // cada item viene como { products: {...} } según la API;
        // si ya devolviste solo products, ajusta a items directamente
        const products = items.map((i: any) => i.products ?? i.product ?? i) as Product[]
        setFavorites(products)
      } catch (e) {
        console.error("Error cargando favoritos", e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 pt-14">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 text-pink-600" />
              <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
            </div>
            <p className="text-gray-600">Los productos que más te gustan</p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Cargando favoritos...</div>
          ) : !user ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Debes iniciar sesión para ver tus favoritos
              </h3>
              <p className="text-gray-500 mb-6">
                Inicia sesión para guardar y ver tus productos favoritos.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Ir a iniciar sesión
              </button>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-gray-500 mb-6">
                Explora nuestros productos y guarda los que más te gusten
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Explorar productos
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
