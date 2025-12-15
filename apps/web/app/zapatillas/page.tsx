import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"
import { ZapatillasClient } from "./ZapatillasClient"

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
    <CategoryPageLayout
      title="Zapatillas"
      description="Explora nuestra selección de zapatillas con estilo y comodidad"
    >
      <ZapatillasClient />
    </CategoryPageLayout>
  )
}
