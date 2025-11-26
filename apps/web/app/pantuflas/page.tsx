import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pantuflas para Mujer - Comodidad y Estilo",
  description:
    "Pantuflas suaves, peludas, memory foam y más. Encuentra tus pantuflas favoritas para el hogar con envío gratis sobre $50.000.",
  keywords: [
    "pantuflas mujer",
    "pantuflas peludas",
    "pantuflas memory foam",
    "pantuflas de casa",
    "pantuflas calientes",
    "pantuflas cómodas",
    "calzado hogar",
  ],
  openGraph: {
    title: "Pantuflas para Mujer - Jess Tendencia",
    description: "Pantuflas suaves, memory foam y para invierno en Jess Tendencia.",
    images: ["/pink-fluffy-slippers.png"],
  },
}

export default function SlippersPage() {
  return (
    <CategoryPageLayout
      title="Pantuflas"
      description="Pantuflas cómodas y con onda para estar en casa con estilo."
    >
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters categorySlug="pantuflas" />
      </div>
      <ProductGrid categorySlug="pantuflas" />
    </CategoryPageLayout>
  )
}
