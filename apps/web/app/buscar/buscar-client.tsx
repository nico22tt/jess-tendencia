"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

function getProductImage(product: any): string {
  const images = product?.images

  if (Array.isArray(images) && typeof images[0] === "string") {
    const first = images[0]?.trim()
    if (first) return first
  }

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === "string" && parsed[0].trim()) return parsed[0]
        if (parsed[0]?.url && typeof parsed[0].url === "string" && parsed[0].url.trim()) {
          return parsed[0].url
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (Array.isArray(images) && images[0]?.url && typeof images[0].url === "string") {
    const first = images[0].url.trim()
    if (first) return first
  }

  if (typeof product?.image === "string" && product.image.trim()) {
    return product.image.trim()
  }

  return "/placeholder.svg"
}

export default function BuscarClient() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchResults() {
      if (!q.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    fetchResults()
  }, [q])

  return (
    <main className="max-w-5xl mx-auto pt-40 px-4">
      <h1 className="text-2xl font-bold mb-4">
        Resultados para: <span className="text-pink-600">{q}</span>
      </h1>

      {loading && <p>Cargando resultados...</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-500">No se encontraron productos.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((product) => {
          const imageUrl = getProductImage(product)

          return (
            <Link
              key={product.id}
              href={`/accesorios/${product.id}`}
              className="block"
            >
              <div className="border rounded-lg p-2 hover:shadow-sm transition bg-white">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.name || "Producto"}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <div className="mt-2 text-sm font-medium line-clamp-2">
                  {product.name}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
