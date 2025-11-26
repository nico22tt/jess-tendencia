"use client"

import { ProductCard } from "@/components/product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@jess/ui/button"
import { useRef } from "react"
import type { Product } from "@jess/shared/types/product"

interface ProductCarouselProps {
  products: Product[]
  category?: string
  title?: string
}

export function ProductCarousel({
  products,
  category = "productos",
  title = "Productos Relacionados",
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Si no hay productos, no renderizar nada
  if (!products || products.length === 0) {
    return null
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Ajustado para card width + gap
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="w-full py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="h-10 w-10 rounded-full border-gray-300 hover:border-pink-500 hover:text-pink-600 transition-colors"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="h-10 w-10 rounded-full border-gray-300 hover:border-pink-500 hover:text-pink-600 transition-colors"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-none w-72">
              <ProductCard product={product} category={category} />
            </div>
          ))}
        </div>

        {/* Indicador visual de más productos */}
        {products.length > 4 && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({ length: Math.ceil(products.length / 4) }).map((_, idx) => (
              <div
                key={idx}
                className="h-1.5 w-8 rounded-full bg-gray-300 transition-colors hover:bg-pink-500"
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
