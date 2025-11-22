"use client"

import { useState } from "react"
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

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  status: "active" | "inactive"
  image: string
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Zapatillas Urbanas Blancas",
    sku: "ZAP-001",
    price: 45990,
    stock: 25,
    category: "Zapatillas",
    status: "active",
    image: "/white-sneakers-for-women.png",
  },
  {
    id: "2",
    name: "Botas de Cuero Negro",
    sku: "BOT-001",
    price: 89990,
    stock: 12,
    category: "Botas",
    status: "active",
    image: "/black-high-boots-for-women.png",
  },
  {
    id: "3",
    name: "Botines Café Elegantes",
    sku: "BTN-001",
    price: 67990,
    stock: 8,
    category: "Botines",
    status: "active",
    image: "/brown-ankle-boots-for-women.png",
  },
  {
    id: "4",
    name: "Jeans Skinny Azul",
    sku: "JNS-001",
    price: 39990,
    stock: 30,
    category: "Jeans",
    status: "active",
    image: "/skinny-blue-jeans-for-women.png",
  },
  {
    id: "5",
    name: "Pantuflas Rosadas Suaves",
    sku: "PAN-001",
    price: 19990,
    stock: 0,
    category: "Pantuflas",
    status: "inactive",
    image: "/pink-slippers-for-women.png",
  },
  {
    id: "6",
    name: "Zapatillas Running Negras",
    sku: "ZAP-002",
    price: 52990,
    stock: 18,
    category: "Zapatillas",
    status: "active",
    image: "/black-running-sneakers-for-women.png",
  },
  {
    id: "7",
    name: "Botas Militares Verdes",
    sku: "BOT-002",
    price: 79990,
    stock: 5,
    category: "Botas",
    status: "active",
    image: "/military-style-boots-for-women.png",
  },
  {
    id: "8",
    name: "Jeans Mom Fit Claro",
    sku: "JNS-002",
    price: 42990,
    stock: 22,
    category: "Jeans",
    status: "active",
    image: "/light-mom-jeans-for-women.png",
  },
]

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
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
                    <SelectItem value="Zapatillas" className="text-white">
                      Zapatillas
                    </SelectItem>
                    <SelectItem value="Botas" className="text-white">
                      Botas
                    </SelectItem>
                    <SelectItem value="Botines" className="text-white">
                      Botines
                    </SelectItem>
                    <SelectItem value="Jeans" className="text-white">
                      Jeans
                    </SelectItem>
                    <SelectItem value="Pantuflas" className="text-white">
                      Pantuflas
                    </SelectItem>
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
                      Activo
                    </SelectItem>
                    <SelectItem value="inactive" className="text-white">
                      Inactivo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-white font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">{product.sku}</TableCell>
                      <TableCell className="text-white font-medium">{formatPrice(product.price)}</TableCell>
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
                      <TableCell className="text-zinc-400">{product.category}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.status === "active"
                              ? "bg-green-600/20 text-green-400 border-green-600/30"
                              : "bg-red-600/20 text-red-400 border-red-600/30"
                          }
                        >
                          {product.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/products/edit/${product.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-red-400 hover:bg-zinc-800 hover:text-red-300 bg-transparent"
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
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
