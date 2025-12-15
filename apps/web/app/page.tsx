import { HeroSection } from "@/components/hero-section"
import { ProductShowcase } from "@/components/product-showcase"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inicio - Moda y Calzado para Mujer",
  description:
    "Bienvenida a Jess Tendencia. Encuentra las últimas tendencias en zapatillas, botas, botines, pantuflas y jeans para mujer. Envío gratis en compras sobre $50.000. Descuentos exclusivos.",
  openGraph: {
    title: "Jess Tendencia - Moda y Calzado para Mujer",
    description:
      "Encuentra las últimas tendencias en zapatillas, botas, botines, pantuflas y jeans para mujer. Envío gratis en compras sobre $50.000.",
    images: ["/elegant-fashion-model-wearing-trendy-outfit-in-sof.png"],
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductShowcase />
    </>
  )
}
