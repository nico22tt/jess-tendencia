// app/jeans/page.tsx
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"
import { JeansClient } from "./JeansClient"

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
    description:
      "Descubre nuestra línea de jeans para mujer. Variedad de fits y modelos.",
    images: ["/blue-skinny-jeans.png"],
  },
}

export default function JeansPage() {
  return (
    <CategoryPageLayout
      title="Jeans"
      description="Jeans que se adaptan a tu cuerpo y a tu actitud."
    >
      <JeansClient />
    </CategoryPageLayout>
  )
}
