"use client"

import useSWR from "swr"
import type { Product } from "@jess/shared/types/product"
import { ProductCard } from "@/components/product-card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Recommendation { product_id: string | number; score: number }

const DEMO_RECO_USER_ID = "20eef2c7-8a4b-4668-be60-c7bc61d09424"

// IDs permitidos siempre como string[]
const allowedProductIds: string[] = [
  "89ea8c1e-f731-4f8f-aff9-fbe6e7c6fbad",
  "4db5bca5-1099-4d08-abf8-2f67d4a01a33",
  "9d531561-660c-4b98-9f87-840859fac008",
  "32fde0d7-fdf6-4514-b446-87b2c88a949f",
  "fcc64d50-1c96-471d-b057-9abb2541b7bf",
  "6890c268-4afc-4d18-8ff2-5885334c911b",
  "228ce409-1553-49b4-9239-ae3168ade9a1",
  "b9d81572-5055-4cdd-a6ac-47685756847f",
  "5b915359-7778-4838-b618-a24ce3117ade",
  "6112bdc1-8fb2-4ce2-bbff-227bd1709242",
]

// util para normalizar ids a string
const toId = (v: unknown) => (v == null ? "" : String(v))

export function ProductShowcase() {
  const { data: recsData, error: recsError, isLoading: recsLoading } =
    useSWR<Recommendation[]>(
      `/api/recommendations?userId=${DEMO_RECO_USER_ID}`,
      fetcher
    )

  const recommendations = (recsData ?? []).slice(0, 9)

  // asegurar string antes de encodeURIComponent
  const idsQuery =
    recommendations.length > 0
      ? recommendations
          .map((r) => `ids=${encodeURIComponent(String(r.product_id))}`)
          .join("&")
      : ""

  const { data: productsFromRecs, error: recsProdErr, isLoading: recsProdLoad } =
    useSWR(idsQuery ? `/api/products?${idsQuery}` : null, fetcher)

  const recommendedProducts: Product[] = productsFromRecs?.data ?? []

  const { data: fallbackData, error: fbErr, isLoading: fbLoad } =
    useSWR(!idsQuery ? "/api/products?limit=9" : null, fetcher)

  const fallbackProducts: Product[] = fallbackData?.data ?? []

  const loading = recsLoading || recsProdLoad || (!idsQuery && fbLoad)
  const error = recsError || recsProdErr || (!idsQuery && fbErr)

  // filtrar solo ids permitidos convirtiendo id a string
  const filteredRecommendedProducts = recommendedProducts.filter((p) =>
    allowedProductIds.includes(toId(p.id))
  )
  const filteredFallbackProducts = fallbackProducts.filter((p) =>
    allowedProductIds.includes(toId(p.id))
  )

  const productsToShow =
    filteredRecommendedProducts.length > 0
      ? filteredRecommendedProducts
      : filteredFallbackProducts

  const isPersonalized = filteredRecommendedProducts.length > 0

  if (loading)
    return (
      <section className="py-16 px-6 mt-0">
        <div className="max-w-6xl mx-auto text-center">
          Cargando productos destacados...
        </div>
      </section>
    )

  if (error || !productsToShow.length) return null

  return (
    <section className="py-16 px-6 mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
            {isPersonalized
              ? "Productos Destacados para ti"
              : "Productos más vendidos"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isPersonalized
              ? "Basados en tu historial y preferencias, estos son los productos que nuestra IA considera más relevantes."
              : "Estos son algunos de los productos más populares y con mejor rendimiento en la tienda."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsToShow.slice(0, 9).map((product) => (
            <ProductCard key={toId(product.id)} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
