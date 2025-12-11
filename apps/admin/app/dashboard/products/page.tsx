"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
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
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 6

  useEffect(() => {
    checkAuth()
    fetchProducts()
    fetchCategories()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
  }

  // Cargar productos
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

  // Cargar categorías para filtro
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
  const getMainImage = (images: any) => {
    // Si images es string, intenta convertirlo a array
    let arr: Array<{ url: string; isMain: boolean }> = []

    if (Array.isArray(images)) {
      arr = images
    } else if (typeof images === "string") {
      try {
        arr = JSON.parse(images)
      } catch { arr = [] }
    } else if (images && typeof images === 'object') {
      // Si es un objeto, intenta envolverlo en array
      arr = [images]
    }

    const mainImg = arr.find(img => img.isMain)
    return mainImg?.url || arr[0]?.url || "/placeholder.svg"
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventario de Productos</h1>
            <p className="text-muted-foreground mt-1">Gestiona todos los productos de tu tienda</p>
          </div>
          <Link href="/dashboard/products/add">
            <Button className="bg-pink-600 hover:bg-pink-700 text-foreground">
              <Plus className="h-5 w-5 mr-2" />
              Añadir Nuevo Producto
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className=" bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="all" className="text-foreground">
                  Todas las categorías
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="all" className="text-foreground">
                  Todos los estados
                </SelectItem>
                <SelectItem value="active" className="text-foreground">
                  Publicado
                </SelectItem>
                <SelectItem value="inactive" className="text-foreground">
                  Borrador
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className=" bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className=" bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              {products.length === 0
                ? "No hay productos. Crea uno para comenzar."
                : "No se encontraron productos con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            {/* Products Table */}
            <div className=" bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Producto</TableHead>
                    <TableHead className="text-muted-foreground">SKU</TableHead>
                    <TableHead className="text-muted-foreground">Precio</TableHead>
                    <TableHead className="text-muted-foreground">Stock</TableHead>
                    <TableHead className="text-muted-foreground">Categoría</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            <img
                              src={getMainImage(product.images)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-foreground font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium">
                            {formatPrice(product.salePrice || product.basePrice)}
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-muted-foreground line-through">
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
                      <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
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
                              className="border-border text-foreground hover:bg-muted bg-transparent"
                              aria-label="Editar producto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-red-400 hover:bg-muted hover:text-red-300 bg-transparent"
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
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de{" "}
                {filteredProducts.length} productos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted bg-transparent"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted bg-transparent"
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
    </AdminDashboardLayout>
  )
}
