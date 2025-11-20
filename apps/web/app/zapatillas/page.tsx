import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Zapatillas para Mujer - Últimas Tendencias",
  description:
    "Descubre nuestra colección de zapatillas para mujer. Zapatillas deportivas, casuales, urbanas y más. Envío gratis en compras sobre $50.000. Las mejores marcas y precios.",
  keywords: [
    "zapatillas mujer",
    "zapatillas deportivas",
    "zapatillas casuales",
    "zapatillas urbanas",
    "calzado deportivo mujer",
    "sneakers mujer",
  ],
  openGraph: {
    title: "Zapatillas para Mujer - Jess Tendencia",
    description:
      "Descubre nuestra colección de zapatillas para mujer. Zapatillas deportivas, casuales, urbanas y más. Envío gratis en compras sobre $50.000.",
    images: ["/trendy-white-sneakers-for-women.png"],
  },
}

export default function ZapatillasPage() {
  return (
    <CategoryPageLayout title="Zapatillas" description="Explora nuestra selección de zapatillas con estilo y comodidad">
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 shadow-sm mb-0.5">
        <ProductFilters />
      </div>

      {/* Products Grid - Full Width */}
      <ProductGrid />
    </CategoryPageLayout>
  )
}
