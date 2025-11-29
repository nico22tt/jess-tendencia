"use client"

import useSWR from "swr"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@jess/shared/types/product"

interface ProductGridProps {
  categorySlug?: string
  products?: Product[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ProductGrid({ categorySlug, products }: ProductGridProps) {
  const { data, error, isLoading } = useSWR(
    !products
      ? categorySlug
        ? `/api/products?categorySlug=${categorySlug}`
        : "/api/products"
      : null,
    fetcher
  )

  const productList: Product[] = products ?? (data?.data ?? [])

  if (isLoading) {
    return <div className="py-24 text-center text-lg">Cargando productos...</div>
  }
  if (error) {
    return <div className="py-24 text-center text-red-600">Error al cargar productos.</div>
  }
  if (!productList.length) {
    return <div className="py-24 text-center text-gray-500">No hay productos disponibles.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productList.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
