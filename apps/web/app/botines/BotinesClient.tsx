// app/botines/BotinesClient.tsx
"use client"

import { useState } from "react"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters, SortOption } from "@/components/product-filters"

export function BotinesClient() {
  const [sort, setSort] = useState<SortOption>("price-low")

  return (
    <>
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm flex justify-end">
        <ProductFilters sort={sort} onChangeSort={setSort} />
      </div>
      <ProductGrid categorySlug="botines" sort={sort} />
    </>
  )
}
