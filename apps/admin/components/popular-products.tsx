"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@jess/ui/card"
import { Badge } from "@jess/ui/badge"
import { Loader2, TrendingUp, Package } from "lucide-react"
import Image from "next/image"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

interface Product {
  id: string
  name: string
  sku: string
  image: string | null
  totalQuantity: number
  totalSales: number
  ordersCount: number
}

export function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("🔍 Fetching popular products...")
      const res = await fetch("/api/stats/popular-products")

      console.log("📡 Response status:", res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`❌ Error ${res.status}:`, errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { details: errorText }
        }
        
        setError(errorData.details || errorData.error || res.statusText)
        setProducts([])
        return
      }

      const json = await res.json()
      console.log("✅ Data received:", json)

      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data)
      } else if (Array.isArray(json)) {
        setProducts(json)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("❌ Fetch error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])


  return (
    <Card className="bg-card border border-border flex flex-col h-[500px]">
      {/* Header - altura fija */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Productos Más Vendidos
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-pink-600" />
        </div>
      </CardHeader>

      {/* Content - altura calculada con scroll */}
      <CardContent className="flex-1 overflow-hidden pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-pink-600 animate-spin" />
              <span className="text-xs text-muted-foreground">Cargando productos...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Package className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-sm text-red-500 text-center">Error: {error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Package className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay productos vendidos este año
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
              >
                {/* Ranking Badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {index + 1}
                  </span>
                </div>

                
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                  {product.image && typeof product.image === 'string' && product.image.trim() !== '' ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      unoptimized
                      onError={(e) => {
                        // Fallback si la imagen falla al cargar
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <Package className={`h-6 w-6 text-muted-foreground fallback-icon ${product.image ? 'hidden' : ''}`} />
                </div>


                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate mb-1">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"
                    >
                      {product.totalQuantity} vendidos
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {product.ordersCount} órdenes
                    </span>
                  </div>
                </div>

                {/* Sales Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(product.totalSales)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.sku}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
