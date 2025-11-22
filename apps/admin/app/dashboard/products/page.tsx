"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Badge } from "@jess/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jess/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  sku: string
  basePrice: number
  salePrice: number | null
  stock: number
  category: Category
  isPublished: boolean
  images: Array<{ url: string; isMain: boolean }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 6

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
        alert('Error al cargar productos')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Cargar categorías para filtro
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }
    fetchCategories()
  }, [])

  // Eliminar producto
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Producto eliminado')
        // Recargar productos
        setProducts(products.filter(p => p.id !== id))
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      alert('❌ Error al eliminar producto')
      console.error(error)
    }
  }

  // Filtros
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category.id === categoryFilter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? product.isPublished : !product.isPublished)
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Obtener imagen principal
  const getMainImage = (images: Array<{ url: string; isMain: boolean }>) => {
    const mainImg = images.find(img => img.isMain)
    return mainImg?.url || images[0]?.url || "/placeholder.svg"
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Inventario de Productos</h1>
                <p className="text-zinc-400 mt-1">Gestiona todos los productos de tu tienda</p>
              </div>
              <Link href="/dashboard/products/add">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Añadir Nuevo Producto
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white">
                      Todas las categorías
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white">
                      Todos los estados
                    </SelectItem>
                    <SelectItem value="active" className="text-white">
                      Publicado
                    </SelectItem>
                    <SelectItem value="inactive" className="text-white">
                      Borrador
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-400">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-400">
                  {products.length === 0
                    ? "No hay productos. Crea uno para comenzar."
                    : "No se encontraron productos con los filtros aplicados."}
                </p>
              </div>
            ) : (
              <>
                {/* Products Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="text-zinc-400">Producto</TableHead>
                        <TableHead className="text-zinc-400">SKU</TableHead>
                        <TableHead className="text-zinc-400">Precio</TableHead>
                        <TableHead className="text-zinc-400">Stock</TableHead>
                        <TableHead className="text-zinc-400">Categoría</TableHead>
                        <TableHead className="text-zinc-400">Estado</TableHead>
                        <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                <img
                                  src={getMainImage(product.images)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-white font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-400">{product.sku}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-white font-medium">
                                {formatPrice(product.salePrice || product.basePrice)}
                              </span>
                              {product.salePrice && (
                                <span className="text-xs text-zinc-500 line-through">
                                  {formatPrice(product.basePrice)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`${
                                product.stock === 0
                                  ? "text-red-400"
                                  : product.stock < 10
                                    ? "text-yellow-400"
                                    : "text-green-400"
                              }`}
                            >
                              {product.stock} unidades
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-400">{product.category.name}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                product.isPublished
                                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                                  : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                              }
                            >
                              {product.isPublished ? "Publicado" : "Borrador"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/products/edit/${product.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                                  aria-label="Editar producto"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-700 text-red-400 hover:bg-zinc-800 hover:text-red-300 bg-transparent"
                                onClick={() => handleDelete(product.id, product.name)}
                                aria-label="Eliminar producto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de{" "}
                    {filteredProducts.length} productos
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-zinc-400">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
