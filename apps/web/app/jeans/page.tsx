import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { CategoryPageLayout } from "@/components/category-page-layout"

const jeansProducts = [
  {
    id: "1",
    name: "Jeans Skinny Azul",
    price: 45990,
    image: "/blue-skinny-jeans.png",
    label: "Bestseller",
  },
  {
    id: "2",
    name: "Jeans Mom Fit",
    price: 52990,
    image: "/mom-fit-jeans.png",
    label: "Trending",
  },
  {
    id: "3",
    name: "Jeans Straight",
    price: 48990,
    image: "/straight-jeans.png",
  },
  {
    id: "4",
    name: "Jeans High Waist",
    price: 55990,
    image: "/high-waist-jeans.png",
    label: "Nuevo",
  },
  {
    id: "5",
    name: "Jeans Boyfriend",
    price: 49990,
    image: "/boyfriend-jeans.png",
  },
  {
    id: "6",
    name: "Jeans Flare",
    price: 58990,
    image: "/flare-jeans.png",
    label: "Retro",
  },
  {
    id: "7",
    name: "Jeans Ripped",
    price: 46990,
    image: "/ripped-jeans.png",
    label: "Edgy",
  },
  {
    id: "8",
    name: "Jeans Premium",
    price: 75990,
    image: "/premium-jeans.png",
    label: "Premium",
  },
]

export default function JeansPage() {
  return (
    <CategoryPageLayout title="Jeans" description="Jeans que se adaptan a tu cuerpo y a tu actitud.">
      <div className="sticky top-[72px] z-40 bg-white py-4 -mx-6 px-6 mb-6 shadow-sm">
        <ProductFilters />
      </div>

      {/* Products Grid - Full Width */}
      <ProductGrid products={jeansProducts} />
    </CategoryPageLayout>
  )
}
