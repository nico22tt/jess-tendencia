"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Button } from "@jess/ui/button"
import { Card } from "@jess/ui/card"
import { Input } from "@jess/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jess/ui/table"

// Mock search results
const mockResults = [
  { id: "PRD-001", name: "Zapatillas Deportivas Nike", type: "Producto", status: "Activo", date: "2024-01-15" },
  { id: "USR-042", name: "María González", type: "Usuario", status: "Activo", date: "2024-01-14" },
  { id: "ORD-128", name: "Pedido #128", type: "Pedido", status: "Completado", date: "2024-01-13" },
  { id: "PRD-002", name: "Botas de Cuero", type: "Producto", status: "Activo", date: "2024-01-12" },
  { id: "USR-043", name: "Carlos Ramírez", type: "Usuario", status: "Inactivo", date: "2024-01-11" },
  { id: "ORD-129", name: "Pedido #129", type: "Pedido", status: "Pendiente", date: "2024-01-10" },
  { id: "PRD-003", name: "Jeans Slim Fit", type: "Producto", status: "Activo", date: "2024-01-09" },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true)
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Búsqueda Avanzada</h1>
              <p className="text-zinc-400">Busca productos, usuarios, pedidos y más en todo el sistema</p>
            </div>

            {/* Search Controls */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="space-y-4">
                {/* Main Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Introduce un término de búsqueda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12 text-lg"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-zinc-400 mb-2 block">Buscar en...</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="products">Productos</SelectItem>
                        <SelectItem value="users">Usuarios</SelectItem>
                        <SelectItem value="orders">Pedidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm text-zinc-400 mb-2 block">Rango de Fechas</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las fechas</SelectItem>
                        <SelectItem value="today">Hoy</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mes</SelectItem>
                        <SelectItem value="year">Último año</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white h-10">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Results */}
            <Card className="bg-zinc-900 border-zinc-800">
              {!hasSearched ? (
                <div className="p-12 text-center">
                  <Search className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                  <p className="text-lg text-zinc-400">Introduce un término para buscar entre miles de registros...</p>
                  <p className="text-sm text-zinc-600 mt-2">
                    Utiliza los filtros para refinar tu búsqueda y encontrar exactamente lo que necesitas
                  </p>
                </div>
              ) : (
                <div>
                  {/* Results Header */}
                  <div className="p-6 border-b border-zinc-800">
                    <p className="text-sm text-zinc-400">
                      Se encontraron <span className="text-white font-semibold">{mockResults.length}</span> resultados
                      para "{searchQuery}"
                    </p>
                  </div>

                  {/* Results Table */}
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">ID</TableHead>
                        <TableHead className="text-zinc-400">Nombre/Título</TableHead>
                        <TableHead className="text-zinc-400">Tipo</TableHead>
                        <TableHead className="text-zinc-400">Estado</TableHead>
                        <TableHead className="text-zinc-400">Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockResults.map((result) => (
                        <TableRow key={result.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell className="font-mono text-sm text-zinc-400">{result.id}</TableCell>
                          <TableCell className="font-medium text-white">{result.name}</TableCell>
                          <TableCell className="text-zinc-400">{result.type}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                result.status === "Activo" || result.status === "Completado"
                                  ? "bg-green-500/10 text-green-500"
                                  : result.status === "Pendiente"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : "bg-zinc-700 text-zinc-400"
                              }`}
                            >
                              {result.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-400">{result.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-sm text-zinc-400">Mostrando 1-7 de 7 resultados</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-zinc-700 text-zinc-400 bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-zinc-700 text-zinc-400 bg-transparent"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
