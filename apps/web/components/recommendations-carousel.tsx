"use client"

import useSWR from "swr"
import type { Product } from "@jess/shared/types/product"
import { ProductCard } from "@/components/product-card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Recommendation { 
  product_id: string | number
  score: number 
}

const DEMO_RECO_USER_ID = "20eef2c7-8a4b-4668-be60-c7bc61d09424"

// IDs permitidos
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

const toId = (v: unknown) => (v == null ? "" : String(v))

export function RecommendationsCarousel() {
  const { data: recsData, error: recsError, isLoading: recsLoading } =
    useSWR<Recommendation[]>(
      `/api/recommendations?userId=${DEMO_RECO_USER_ID}`,
      fetcher
    )

  const recommendations = (recsData ?? []).slice(0, 10)

  const idsQuery =
    recommendations.length > 0
      ? recommendations
          .map((r) => `ids=${encodeURIComponent(String(r.product_id))}`)
          .join("&")
      : ""

  const { data: productsData, error: productsError, isLoading: productsLoading } =
    useSWR(idsQuery ? `/api/products?${idsQuery}` : null, fetcher)

  const recommendedProducts: Product[] = productsData?.data ?? []

  const { data: fallbackData, error: fallbackError, isLoading: fallbackLoading } =
    useSWR(!idsQuery ? "/api/products?limit=10" : null, fetcher)

  const fallbackProducts: Product[] = fallbackData?.data ?? []

  const loading = recsLoading || productsLoading || (!idsQuery && fallbackLoading)
  const error = recsError || productsError || (!idsQuery && fallbackError)

  // Solo mostrar IDs permitidos
  const filteredRecommended = recommendedProducts.filter((p) =>
    allowedProductIds.includes(toId(p.id))
  )
  const filteredFallback = fallbackProducts.filter((p) =>
    allowedProductIds.includes(toId(p.id))
  )

  const productsToShow: Product[] =
    filteredRecommended.length > 0 ? filteredRecommended : filteredFallback

  const isPersonalized = filteredRecommended.length > 0

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          Cargando recomendaciones...
        </div>
      </div>
    )
  }

  if (error || !productsToShow.length) return null

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {isPersonalized ? "Te puede interesar" : "Productos populares"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {productsToShow.slice(0, 10).map((product: Product) => (
            <div
              key={toId(product.id)}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition group"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
