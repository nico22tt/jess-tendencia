import { Sidebar } from "@jess/shared/components/sidebar"
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <HeroSection />
          <ProductShowcase />
        </main>
      </div>
    </div>
  )
}
