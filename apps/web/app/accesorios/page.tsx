import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accesorios para Mujer - Últimas Tendencias",
  description:
    "Descubre nuestra colección de accesorios para mujer. Carteras, billeteras, cinturones, bolsos y más. Envío gratis en compras sobre $50.000. Las mejores marcas y precios.",
  keywords: [
    "accesorios mujer",
    "carteras",
    "billeteras",
    "bolsos",
    "cinturones mujer",
    "accesorios moda",
    "complementos mujer",
  ],
  openGraph: {
    title: "Accesorios para Mujer - Jess Tendencia",
    description:
      "Descubre nuestra colección de accesorios para mujer. Carteras, billeteras, cinturones, bolsos y más. Envío gratis en compras sobre $50.000.",
    images: ["/accesorios-hero.png"],
  },
}

export default function AccesoriosPage() {
  return (
    <CategoryPageLayout
      title="Accesorios"
      description="Explora nuestra selección de accesorios con estilo y elegancia"
    >
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 shadow-sm mb-0.5">
        <ProductFilters categorySlug="accesorios" />
      </div>
      <ProductGrid categorySlug="accesorios" />
    </CategoryPageLayout>
  )
}
