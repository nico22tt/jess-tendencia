"use client"

import useSWR from "swr"
import type { Product } from "@jess/shared/types/product"
import { ProductCard } from "@/components/product-card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// util para normalizar ids a string
const toId = (v: unknown) => (v == null ? "" : String(v))

export function ProductShowcase() {
  // Obtener productos más recientes directamente
  const { data: productsData, error, isLoading } = useSWR<{ data: Product[] }>(
    "/api/products?limit=9&sort=createdAt&order=desc",
    fetcher
  )

  const products: Product[] = productsData?.data ?? []

  if (isLoading) {
    return (
      <section className="py-16 px-6 mt-0">
        <div className="max-w-6xl mx-auto text-center">
          Cargando productos destacados...
        </div>
      </section>
    )
  }

  if (error || !products.length) return null

  return (
    <section className="py-16 px-6 mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
            Productos más recientes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubre los últimos productos agregados a nuestra tienda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 9).map((product) => (
            <ProductCard key={toId(product.id)} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* 
 * VERSIÓN CON RECOMENDACIONES DE ML (Descomentar cuando tengas el modelo desplegado):
 * 
 * 1. Descomenta el código de abajo y reemplaza el componente actual
 * 2. Asegúrate de tener la API /api/recommendations funcionando
 * 3. El modelo debe estar corriendo en tu servicio de ML (Docker, Railway, Render, etc.)
 * 4. Actualiza DEMO_RECO_USER_ID con un userId real que tenga historial de compras
 * 
 * interface Recommendation { product_id: string | number; score: number }
 * 
 * const DEMO_RECO_USER_ID = "20eef2c7-8a4b-4668-be60-c7bc61d09424"
 * 
 * export function ProductShowcase() {
 *   // 1) Recomendaciones con user demo fijo
 *   const { data: recsData, error: recsError, isLoading: recsLoading } =
 *     useSWR<Recommendation[]>(
 *       `/api/recommendations?userId=${DEMO_RECO_USER_ID}`,
 *       fetcher
 *     )
 * 
 *   const recommendations = (recsData ?? []).slice(0, 9)
 * 
 *   // 2) Si hay recomendaciones, pedir productos por ID
 *   const idsQuery =
 *     recommendations.length > 0
 *       ? recommendations
 *           .map((r) => `ids=${encodeURIComponent(String(r.product_id))}`)
 *           .join("&")
 *       : ""
 * 
 *   const { data: productsFromRecs, error: recsProdErr, isLoading: recsProdLoad } =
 *     useSWR(idsQuery ? `/api/products?${idsQuery}` : null, fetcher)
 * 
 *   const recommendedProducts: Product[] = productsFromRecs?.data ?? []
 * 
 *   // 3) Fallback: productos más recientes
 *   const { data: fallbackData, error: fbErr, isLoading: fbLoad } =
 *     useSWR(!idsQuery ? "/api/products?limit=9&sort=createdAt&order=desc" : null, fetcher)
 * 
 *   const fallbackProducts: Product[] = fallbackData?.data ?? []
 * 
 *   const loading = recsLoading || recsProdLoad || (!idsQuery && fbLoad)
 *   const error = recsError || recsProdErr || (!idsQuery && fbErr)
 * 
 *   const productsToShow = recommendedProducts.length > 0 ? recommendedProducts : fallbackProducts
 *   const isPersonalized = recommendedProducts.length > 0
 * 
 *   if (loading) {
 *     return (
 *       <section className="py-16 px-6 mt-0">
 *         <div className="max-w-6xl mx-auto text-center">
 *           Cargando productos destacados...
 *         </div>
 *       </section>
 *     )
 *   }
 * 
 *   if (error || !productsToShow.length) return null
 * 
 *   return (
 *     <section className="py-16 px-6 mt-0">
 *       <div className="max-w-6xl mx-auto">
 *         <div className="text-center mb-12">
 *           <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
 *             {isPersonalized ? "Productos Destacados para ti" : "Productos más recientes"}
 *           </h2>
 *           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
 *             {isPersonalized
 *               ? "Basados en tu historial y preferencias, estos son los productos que nuestra IA considera más relevantes."
 *               : "Descubre los últimos productos agregados a nuestra tienda."}
 *           </p>
 *         </div>
 * 
 *         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 *           {productsToShow.slice(0, 9).map((product) => (
 *             <ProductCard key={toId(product.id)} product={product} />
 *           ))}
 *         </div>
 *       </div>
 *     </section>
 *   )
 * }
 */
