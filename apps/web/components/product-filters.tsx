"use client"

import { useState } from "react"
import { Button } from "@jess/ui/button"
import { Checkbox } from "@jess/ui/checkbox"
import { Input } from "@jess/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@jess/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@jess/ui/accordion"
import { Filter, X, Search, Star } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jess/ui/select"

const sizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"]
const visibleSizes = 8

const priceRanges = [
  { label: "$0 - $10.000", min: 0, max: 10000 },
  { label: "$10.000 - $20.000", min: 10000, max: 20000 },
  { label: "$20.000 - $30.000", min: 20000, max: 30000 },
  { label: "$30.000 - $50.000", min: 30000, max: 50000 },
  { label: "$50.000+", min: 50000, max: 999999 },
]

const brands = ["Adidas", "Nike", "Puma", "Reebok", "New Balance", "Converse", "Vans"]

const colors = ["Negro", "Blanco", "Gris", "Azul", "Rojo", "Rosa", "Verde", "Amarillo"]

const ratings = [5, 4, 3, 2, 1]

export type SortOption =
  | "recommended"
  | "price-high"
  | "price-low"
  | "discount"
  | "newest"
  | "rating"

export interface ProductFilterState {
  sizes: string[]
  priceRange?: { min: number; max: number }
  brandNames: string[]
  colors: string[]
  minRating?: number
  onlyDiscount?: boolean
}

export const defaultFilterState: ProductFilterState = {
  sizes: [],
  priceRange: undefined,
  brandNames: [],
  colors: [],
  minRating: undefined,
  onlyDiscount: false,
}

interface FilterContentProps {
  value: ProductFilterState
  onChange: (next: ProductFilterState) => void
}

function FilterContent({ value, onChange }: FilterContentProps) {
  const [showAllSizes, setShowAllSizes] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const displayedSizes = showAllSizes ? sizes : sizes.slice(0, visibleSizes)
  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase()),
  )

  const toggleArrayValue = (field: keyof ProductFilterState, v: string) => {
    const current = (value[field] as string[]) ?? []
    const exists = current.includes(v)
    const next = exists ? current.filter((x) => x !== v) : [...current, v]
    onChange({ ...value, [field]: next })
  }

  const applyPriceInputs = () => {
    const min = minPrice ? Number(minPrice) : undefined
    const max = maxPrice ? Number(maxPrice) : undefined
    if (min === undefined && max === undefined) {
      onChange({ ...value, priceRange: undefined })
      return
    }
    onChange({
      ...value,
      priceRange: { min: min ?? 0, max: max ?? 999999999 },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Accordion
          type="multiple"
          defaultValue={["size", "price", "brand", "color", "rating", "discount"]}
          className="space-y-4"
        >
          {/* Talla */}
          <AccordionItem value="size" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Talla
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {displayedSizes.map((size) => {
                    const checked = value.sizes?.includes(size)
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleArrayValue("sizes", size)}
                        className={`flex items-center justify-center p-2.5 border rounded-md text-sm font-medium transition-colors ${
                          checked
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {sizes.length > visibleSizes && (
                  <Button
                    variant="link"
                    onClick={() => setShowAllSizes(!showAllSizes)}
                    className="text-pink-600 hover:text-pink-700 p-0 h-auto font-medium"
                  >
                    {showAllSizes ? "Mostrar menos" : "Mostrar más"}
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Precio */}
          <AccordionItem value="price" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Precio
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="$Mín."
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="$Máx."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyPriceInputs}
                    className="whitespace-nowrap"
                  >
                    Aplicar
                  </Button>
                </div>
                <div className="space-y-2">
                  {priceRanges.map((range) => {
                    const checked =
                      value.priceRange &&
                      value.priceRange.min === range.min &&
                      value.priceRange.max === range.max
                    return (
                      <label
                        key={range.label}
                        className="flex items-center space-x-2 cursor-pointer group"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) =>
                            onChange({
                              ...value,
                              priceRange: val
                                ? { min: range.min, max: range.max }
                                : undefined,
                            })
                          }
                          className="border-gray-300"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {range.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Marca */}
          <AccordionItem value="brand" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Marca
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar marca..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredBrands.map((brand) => {
                    const checked = value.brandNames?.includes(brand)
                    return (
                      <label
                        key={brand}
                        className="flex items-center space-x-2 cursor-pointer group"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleArrayValue("brandNames", brand)}
                          className="border-gray-300"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {brand}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Color */}
          <AccordionItem value="color" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Color
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {colors.map((color) => {
                  const checked = value.colors?.includes(color)
                  return (
                    <label
                      key={color}
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleArrayValue("colors", color)}
                        className="border-gray-300"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {color}
                      </span>
                    </label>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Calificaciones */}
          <AccordionItem value="rating" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Calificaciones
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {ratings.map((stars) => {
                  const checked = value.minRating === stars
                  return (
                    <label
                      key={stars}
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          onChange({
                            ...value,
                            minRating: v ? stars : undefined,
                          })
                        }
                        className="border-gray-300"
                      />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </label>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Descuento */}
          <AccordionItem value="discount" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Descuento
            </AccordionTrigger>
            <AccordionContent>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <Checkbox
                  checked={!!value.onlyDiscount}
                  onCheckedChange={(v) =>
                    onChange({ ...value, onlyDiscount: Boolean(v) })
                  }
                  className="border-gray-300"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Con Descuento
                </span>
              </label>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t border-gray-200 p-6 bg-white">
        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3">
          Aplicar filtros
        </Button>
      </div>
    </div>
  )
}

interface ProductFiltersProps {
  categorySlug?: string
  filters?: ProductFilterState
  onChangeFilters?: (next: ProductFilterState) => void
  sort?: SortOption
  onChangeSort?: (s: SortOption) => void
}

export function ProductFilters({
  filters,
  onChangeFilters,
  sort,
  onChangeSort,
}: ProductFiltersProps) {
  const safeFilters = filters ?? defaultFilterState

  const activeFiltersCount =
    (safeFilters.sizes?.length ?? 0) +
    (safeFilters.brandNames?.length ?? 0) +
    (safeFilters.colors?.length ?? 0) +
    (safeFilters.priceRange ? 1 : 0) +
    (safeFilters.minRating ? 1 : 0) +
    (safeFilters.onlyDiscount ? 1 : 0)

  const handleClear = () =>
    onChangeFilters?.({
      ...defaultFilterState,
    })

  return (
    <div className="flex items-center gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-white border-gray-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filtros ({activeFiltersCount})
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xl font-bold text-gray-900">
              Filtrar
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                Limpiar filtros
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <FilterContent
            value={safeFilters}
            onChange={(next) => onChangeFilters?.(next)}
          />
        </SheetContent>
      </Sheet>

      <Select
        value={sort ?? "recommended"}
        onValueChange={(v) => onChangeSort?.(v as SortOption)}
      >
        <SelectTrigger className="w-[200px] bg-white border-gray-300">
          <SelectValue placeholder="Ordenar por:" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recomendados</SelectItem>
          <SelectItem value="price-high">Precio mayor a menor</SelectItem>
          <SelectItem value="price-low">Precio menor a mayor</SelectItem>
          <SelectItem value="discount">Mejor descuento</SelectItem>
          <SelectItem value="newest">Mas Nuevos</SelectItem>
          <SelectItem value="rating">Mejor Evaluados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
