// components/product-filters.tsx
"use client"

import { useState } from "react"
import { Button } from "@jess/ui/button"
import { Checkbox } from "@jess/ui/checkbox"
import { Input } from "@jess/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@jess/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@jess/ui/accordion"
import { Filter, X, Search, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"

const sizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"]
const visibleSizes = 8

const priceRanges = [
  { label: "$0 - $10.000", min: 0, max: 10000, count: 245 },
  { label: "$10.000 - $20.000", min: 10000, max: 20000, count: 532 },
  { label: "$20.000 - $30.000", min: 20000, max: 30000, count: 1203 },
  { label: "$30.000 - $50.000", min: 30000, max: 50000, count: 2145 },
  { label: "$50.000+", min: 50000, max: 999999, count: 892 },
]

const brands = [
  { name: "Adidas", count: 1245 },
  { name: "Nike", count: 2103 },
  { name: "Puma", count: 876 },
  { name: "Reebok", count: 543 },
  { name: "New Balance", count: 432 },
  { name: "Converse", count: 321 },
  { name: "Vans", count: 654 },
]

const colors = [
  { name: "Negro", count: 3421 },
  { name: "Blanco", count: 2876 },
  { name: "Gris", count: 1543 },
  { name: "Azul", count: 1234 },
  { name: "Rojo", count: 987 },
  { name: "Rosa", count: 765 },
  { name: "Verde", count: 543 },
  { name: "Amarillo", count: 1061 },
]

const ratings = [
  { stars: 5, count: 4532 },
  { stars: 4, count: 3210 },
  { stars: 3, count: 1876 },
  { stars: 2, count: 543 },
  { stars: 1, count: 234 },
]

function FilterContent() {
  const [showAllSizes, setShowAllSizes] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const displayedSizes = showAllSizes ? sizes : sizes.slice(0, visibleSizes)
  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Accordion
          type="multiple"
          defaultValue={["size", "price", "brand", "color", "rating", "discount"]}
          className="space-y-4"
        >
          <AccordionItem value="size" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Talla
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {displayedSizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center justify-center p-2.5 border border-gray-300 rounded-md cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors text-sm font-medium"
                    >
                      <Checkbox className="sr-only" />
                      {size}
                    </label>
                  ))}
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
                </div>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center space-x-2 cursor-pointer group">
                      <Checkbox className="border-gray-300" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {range.label} <span className="text-gray-500">({range.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

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
                  {filteredBrands.map((brand) => (
                    <label key={brand.name} className="flex items-center space-x-2 cursor-pointer group">
                      <Checkbox className="border-gray-300" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {brand.name} <span className="text-gray-500">({brand.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="color" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Color
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {colors.map((color) => (
                  <label key={color.name} className="flex items-center space-x-2 cursor-pointer group">
                    <Checkbox className="border-gray-300" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {color.name} <span className="text-gray-500">({color.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Calificaciones
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {ratings.map((rating) => (
                  <label key={rating.stars} className="flex items-center space-x-2 cursor-pointer group">
                    <Checkbox className="border-gray-300" />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rating.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 ml-1">({rating.count})</span>
                    </div>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="discount" className="border-b border-gray-200">
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline">
              Descuento
            </AccordionTrigger>
            <AccordionContent>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <Checkbox className="border-gray-300" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Con Descuento</span>
              </label>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t border-gray-200 p-6 bg-white">
        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3">
          Mostrar 18,709 productos
        </Button>
      </div>
    </div>
  )
}

interface ProductFiltersProps {
  categorySlug?: string
}

export function ProductFilters({ categorySlug }: ProductFiltersProps) {
  const [activeFiltersCount] = useState(0)

  return (
    <div className="flex items-center gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 bg-white border-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filtros ({activeFiltersCount})
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xl font-bold text-gray-900">Filtrar</SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50">
                Limpiar filtros
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <FilterContent />
        </SheetContent>
      </Sheet>

      <Select defaultValue="recommended">
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
