import { ProductCard } from "@/components/product-card"

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  label?: string
  labelType?: "new" | "sale"
}

interface ProductGridProps {
  products?: Product[]
}

const defaultProducts = [
  {
    id: 1,
    name: "Zapatillas Deportivas Blancas",
    price: 89990,
    image: "/white-sneakers-for-women.png",
    label: "Nuevo",
    labelType: "new" as const,
  },
  {
    id: 2,
    name: "Zapatillas Casual Rosa",
    price: 79990,
    image: "/pink-casual-sneakers-for-women.png",
    label: "Oferta",
    labelType: "sale" as const,
  },
  {
    id: 3,
    name: "Zapatillas Running Negras",
    price: 99990,
    image: "/black-running-sneakers-for-women.png",
  },
  {
    id: 4,
    name: "Zapatillas Urbanas Beige",
    price: 85990,
    image: "/beige-urban-sneakers-for-women.png",
  },
  {
    id: 5,
    name: "Zapatillas Plataforma Blancas",
    price: 94990,
    image: "/white-platform-sneakers-for-women.png",
    label: "Nuevo",
    labelType: "new" as const,
  },
  {
    id: 6,
    name: "Zapatillas Retro Rosa",
    price: 87990,
    image: "/retro-pink-sneakers-for-women.png",
  },
  {
    id: 7,
    name: "Zapatillas Minimalistas Negras",
    price: 92990,
    image: "/minimalist-black-sneakers-for-women.png",
  },
  {
    id: 8,
    name: "Zapatillas Chunky Beige",
    price: 109990,
    image: "/chunky-beige-sneakers-for-women.png",
    label: "Oferta",
    labelType: "sale" as const,
  },
]

export function ProductGrid({ products = defaultProducts }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
