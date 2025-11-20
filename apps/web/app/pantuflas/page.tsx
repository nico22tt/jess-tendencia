import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"

const slipperProducts = [
  {
    id: "1",
    name: "Pantuflas Peludas Rosa",
    price: 25990,
    image: "/pink-fluffy-slippers.png",
    label: "Bestseller",
  },
  {
    id: "2",
    name: "Pantuflas Memory Foam",
    price: 35990,
    image: "/memory-foam-slippers.png",
    label: "Comfort",
  },
  {
    id: "3",
    name: "Pantuflas de Casa",
    price: 19990,
    image: "/house-slippers.png",
  },
  {
    id: "4",
    name: "Pantuflas con Suela",
    price: 29990,
    image: "/sole-slippers.png",
  },
  {
    id: "5",
    name: "Pantuflas Abrigadas",
    price: 32990,
    image: "/warm-slippers.png",
    label: "Invierno",
  },
  {
    id: "6",
    name: "Pantuflas Elegantes",
    price: 39990,
    image: "/elegant-slippers.png",
    label: "Premium",
  },
  {
    id: "7",
    name: "Pantuflas Deportivas",
    price: 27990,
    image: "/sport-slippers.png",
  },
  {
    id: "8",
    name: "Pantuflas Vintage",
    price: 24990,
    image: "/vintage-slippers.png",
    label: "Retro",
  },
]

export default function SlippersPage() {
  return (
    <CategoryPageLayout title="Pantuflas" description="Pantuflas cómodas y con onda para estar en casa con estilo.">
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters />
      </div>

      {/* Products Grid - Full Width */}
      <ProductGrid products={slipperProducts} />
    </CategoryPageLayout>
  )
}
