"use client"

import { Card } from "@jess/ui/card"
import Image from "next/image"

const products = [
  {
    id: 1,
    name: "Adidas CoreFit T-Shirt",
    price: "$39.9K",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Nike Air Max Sneakers",
    price: "$52.3K",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Puma Running Shorts",
    price: "$28.7K",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 4,
    name: "Under Armour Hoodie",
    price: "$45.1K",
    image: "/placeholder.svg?height=60&width=60",
  },
]

export function PopularProducts() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Popular Products</h3>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{product.name}</p>
              <p className="text-sm text-zinc-400">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
