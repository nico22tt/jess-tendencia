import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Botines para Mujer - Estilo Urbano y Elegante",
  description:
    "Descubre nuestra colección de botines para mujer. Botines Chelsea, con tacón, casuales, de cuero y más. Envío gratis en compras sobre $50.000. Perfectos para cualquier ocasión.",
  keywords: [
    "botines mujer",
    "botines chelsea",
    "botines con tacón",
    "botines casuales",
    "botines de cuero",
    "ankle boots",
    "calzado urbano mujer",
  ],
  openGraph: {
    title: "Botines para Mujer - Jess Tendencia",
    description:
      "Descubre nuestra colección de botines para mujer. Botines Chelsea, con tacón, casuales, de cuero y más. Envío gratis en compras sobre $50.000.",
    images: ["/black-chelsea-ankle-boots.png"],
  },
}

const ankleBootProducts = [
  {
    id: "1",
    name: "Botines Chelsea Negros",
    price: 75990,
    image: "/black-chelsea-ankle-boots.png",
    label: "Bestseller",
  },
  {
    id: "2",
    name: "Botines con Tacón",
    price: 85990,
    image: "/heeled-ankle-boots.png",
    label: "Nuevo",
  },
  {
    id: "3",
    name: "Botines Casuales",
    price: 65990,
    image: "/casual-ankle-boots.png",
  },
  {
    id: "4",
    name: "Botines de Cuero",
    price: 95990,
    image: "/leather-ankle-boots.png",
    label: "Premium",
  },
  {
    id: "5",
    name: "Botines Deportivos",
    price: 55990,
    image: "/sport-ankle-boots.png",
  },
  {
    id: "6",
    name: "Botines con Plataforma",
    price: 79990,
    image: "/platform-ankle-boots.png",
    label: "Trending",
  },
  {
    id: "7",
    name: "Botines Elegantes",
    price: 105990,
    image: "/elegant-ankle-boots.png",
  },
  {
    id: "8",
    name: "Botines Vintage",
    price: 89990,
    image: "/vintage-ankle-boots.png",
    label: "Oferta",
  },
]

export default function AnkleBootsPage() {
  return (
    <CategoryPageLayout title="Botines" description="Botines versátiles para looks urbanos y elegantes.">
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters />
      </div>

      {/* Products Grid - Full Width */}
      <ProductGrid products={ankleBootProducts} />
    </CategoryPageLayout>
  )
}
