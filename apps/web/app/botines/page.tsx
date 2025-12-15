// app/botines/page.tsx
import { CategoryPageLayout } from "@/components/category-page-layout"
import type { Metadata } from "next"
import { BotinesClient } from "./BotinesClient"

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

export default function AnkleBootsPage() {
  return (
    <CategoryPageLayout
      title="Botines"
      description="Botines versátiles para looks urbanos y elegantes."
    >
      <BotinesClient />
    </CategoryPageLayout>
  )
}
