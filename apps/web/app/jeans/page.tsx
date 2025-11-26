import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jeans para Mujer - Estilo y Versatilidad",
  description:
    "Descubre nuestra línea de jeans para mujer. Skinny, mom, straight, high waist y más. Envío gratis sobre $50.000. ¡Encuentra tu fit perfecto!",
  keywords: [
    "jeans mujer",
    "jeans skinny",
    "jeans high waist",
    "jeans mom fit",
    "jeans rectos",
    "pantalones de mezclilla",
    "moda mujer",
  ],
  openGraph: {
    title: "Jeans para Mujer - Jess Tendencia",
    description: "Descubre nuestra línea de jeans para mujer. Variedad de fits y modelos.",
    images: ["/blue-skinny-jeans.png"],
  },
}

export default function JeansPage() {
  return (
    <CategoryPageLayout
      title="Jeans"
      description="Jeans que se adaptan a tu cuerpo y a tu actitud."
    >
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters categorySlug="jeans" />
      </div>
      <ProductGrid categorySlug="jeans" />
    </CategoryPageLayout>
  )
}
