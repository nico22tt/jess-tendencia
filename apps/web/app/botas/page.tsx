// app/botas/page.tsx
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"
import { BotasClient } from "./BotasClient"

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

export default function BootsPage() {
  return (
    <CategoryPageLayout
      title="Botas"
      description="Descubre nuestras botas con carácter y estilo para cada temporada."
    >
      <BotasClient />
    </CategoryPageLayout>
  )
}
