import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Botas para Mujer - Estilo y Comodidad",
  description: "Explora nuestra colección de botas para mujer. Botas altas, militares, texanas, con tacón y más. Envío gratis en compras sobre $50.000. Encuentra tu estilo perfecto.",
  keywords: [
    "botas mujer",
    "botas altas",
    "botas militares",
    "botas texanas",
    "botas con tacón",
    "botas de cuero",
    "calzado mujer",
  ],
  openGraph: {
    title: "Botas para Mujer - Jess Tendencia",
    description: "Explora nuestra colección de botas para mujer. Botas altas, militares, texanas, con tacón y más. Envío gratis en compras sobre $50.000.",
    images: ["/black-high-boots-for-women.png"],
  },
}

export default function BootsPage() {
  return (
    <CategoryPageLayout
      title="Botas"
      description="Descubre nuestras botas con carácter y estilo para cada temporada."
    >
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters categorySlug="botas" />
      </div>
      <ProductGrid categorySlug="botas" />
    </CategoryPageLayout>
  )
}
