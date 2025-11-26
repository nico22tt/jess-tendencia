"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(value)

interface Product {
  id: string
  name: string
  totalQuantity: number
  totalSales: number
}

export function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/popular-products")
        const json = await res.json()
        // Asegura que products sea array, aunque la API falle
        setProducts(Array.isArray(json) ? json : [])
      } catch {
        setProducts([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Popular Products</h3>
      <div className="flex-1 overflow-auto space-y-4">
        {loading ? (
          <div className="text-zinc-400 text-sm">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="text-zinc-400 text-sm">No hay productos vendidos</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="w-[60px] h-[60px] rounded-lg bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-500 text-xs">IMG</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{product.name}</p>
                <p className="text-sm text-zinc-400">{formatCurrency(product.totalSales)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
