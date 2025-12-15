"use client"

import useSWR from "swr"
import { useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@jess/shared/types/product"
import type { SortOption } from "@/components/product-filters"

interface ProductGridProps {
  categorySlug?: string
  products?: Product[]
  sort?: SortOption
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getDisplayPrice = (product: Product): number => {
  if (typeof product.salePrice === "number" && product.salePrice > 0) return product.salePrice
  if (typeof product.basePrice === "number") return product.basePrice
  return typeof product.price === "number" ? product.price : 0
}

const sortProducts = (products: Product[], sort?: SortOption): Product[] => {
  if (!sort) return products
  const arr = [...products]

  switch (sort) {
    case "price-low":
      return arr.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b))
    case "price-high":
      return arr.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a))
    case "bestseller":
      return arr.sort(
        (a, b) => ((b as any).soldCount ?? 0) - ((a as any).soldCount ?? 0)
      )
    case "newest":
      return arr.sort((a, b) => {
        const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0
        const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0
        return db - da
      })
    default:
      return arr
  }
}

export function ProductGrid({ categorySlug, products, sort }: ProductGridProps) {
  const { data, error, isLoading } = useSWR(
    !products
      ? categorySlug
        ? `/api/products?categorySlug=${categorySlug}`
        : "/api/products"
      : null,
    fetcher
  )

  const productList: Product[] = products ?? (data?.data ?? [])

  const sortedProducts = useMemo(
    () => sortProducts(productList, sort),
    [productList, sort]
  )

  if (isLoading && !products) {
    return <div className="py-24 text-center text-lg">Cargando productos...</div>
  }
  if (error) {
    return <div className="py-24 text-center text-red-600">Error al cargar productos.</div>
  }
  if (!sortedProducts.length) {
    return <div className="py-24 text-center text-gray-500">No hay productos disponibles.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          category={categorySlug}
        />
      ))}
    </div>
  )
}
