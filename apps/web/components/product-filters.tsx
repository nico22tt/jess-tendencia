"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"

export type SortOption = "price-low" | "price-high" | "bestseller" | "newest"

interface SimpleFiltersProps {
  sort: SortOption
  onChangeSort: (s: SortOption) => void
}

export function ProductFilters({ sort, onChangeSort }: SimpleFiltersProps) {
  return (
    <Select value={sort} onValueChange={(v) => onChangeSort(v as SortOption)}>
      <SelectTrigger className="w-[200px] bg-white border-gray-300">
        <SelectValue placeholder="Ordenar por:" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-md ">
        <SelectItem value="price-low">Precio menor a mayor</SelectItem>
        <SelectItem value="price-high">Precio mayor a menor</SelectItem>
        <SelectItem value="bestseller">Más vendidos</SelectItem>
        <SelectItem value="newest">Más nuevos</SelectItem>
      </SelectContent>
    </Select>
  )
}
