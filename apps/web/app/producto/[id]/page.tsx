import { notFound } from "next/navigation"
import { Header } from "@/components/header"

// This would typically come from a database or API
const getProduct = (id: string) => {
  // Mock product data - in a real app this would be fetched from your data source
  const products = {
    "1": {
      id: 1,
      name: "Zapatillas Deportivas Blancas",
      price: 89990,
      description: "Zapatillas deportivas de alta calidad con diseño moderno y comodidad excepcional.",
      images: ["/white-sneakers-for-women.png"],
    },
    // Add more products as needed
  }

  return products[id as keyof typeof products] || null
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 to-white">
      <Header />

      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-8">{product.description}</p>
            <p className="text-2xl font-bold text-pink-600">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(product.price)}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
