import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Botas para Mujer - Estilo y Comodidad",
  description:
    "Explora nuestra colección de botas para mujer. Botas altas, militares, texanas, con tacón y más. Envío gratis en compras sobre $50.000. Encuentra tu estilo perfecto.",
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
    description:
      "Explora nuestra colección de botas para mujer. Botas altas, militares, texanas, con tacón y más. Envío gratis en compras sobre $50.000.",
    images: ["/black-high-boots-for-women.png"],
  },
}

const bootProducts = [
  {
    id: "1",
    name: "Botas Altas Negras",
    price: 89990,
    image: "/black-high-boots-for-women.png",
    label: "Nuevo",
  },
  {
    id: "2",
    name: "Botas Marrones Cuero",
    price: 95990,
    image: "/brown-leather-boots-for-women.png",
    label: "Bestseller",
  },
  {
    id: "3",
    name: "Botas Militares",
    price: 79990,
    image: "/military-style-boots-for-women.png",
  },
  {
    id: "4",
    name: "Botas Texanas",
    price: 105990,
    image: "/cowboy-boots-for-women.png",
    label: "Nuevo",
  },
  {
    id: "5",
    name: "Botas de Lluvia",
    price: 45990,
    image: "/rain-boots-for-women.png",
  },
  {
    id: "6",
    name: "Botas con Tacón",
    price: 115990,
    image: "/heeled-boots-for-women.png",
    label: "Oferta",
  },
  {
    id: "7",
    name: "Botas Deportivas",
    price: 69990,
    image: "/sport-boots-for-women.png",
  },
  {
    id: "8",
    name: "Botas Elegantes",
    price: 125990,
    image: "/elegant-boots-for-women.png",
    label: "Premium",
  },
]

export default function BootsPage() {
  return (
    <CategoryPageLayout title="Botas" description="Descubrí nuestras botas con carácter y estilo para cada temporada.">
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters />
      </div>

      {/* Products Grid - Full Width */}
      <ProductGrid products={bootProducts} />
    </CategoryPageLayout>
  )
}
