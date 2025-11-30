"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

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
        setProducts(Array.isArray(json) ? json : [])
      } catch {
        setProducts([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <Card className="bg-card border border-border p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Popular Products
      </h3>
      <div className="flex-1 overflow-auto space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No hay productos vendidos
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="w-[60px] h-[60px] rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">IMG</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(product.totalSales)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
