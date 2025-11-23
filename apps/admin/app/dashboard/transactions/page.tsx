"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Badge } from "@jess/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jess/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Plus, Search, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  users: {
    id: string
    name: string
    email: string
  }
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    products: {
      id: string
      name: string
    }
  }>
}

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Cargar órdenes desde la API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (orderStatusFilter !== 'all') {
          params.append('status', orderStatusFilter)
        }

        const res = await fetch(`/api/orders?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          setOrders(data.data)
        } else {
          console.error('Error al cargar órdenes:', data.error)
          alert('Error al cargar órdenes')
        }
      } catch (error) {
        console.error('Error al cargar órdenes:', error)
        alert('Error al cargar órdenes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [orderStatusFilter])

  // Filtrar órdenes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendiente", className: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" },
      PAID: { label: "Pagado", className: "bg-green-600/20 text-green-400 border-green-600/30" },
      PROCESSING: { label: "Procesando", className: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
      SHIPPED: { label: "Enviado", className: "bg-purple-600/20 text-purple-400 border-purple-600/30" },
      DELIVERED: { label: "Entregado", className: "bg-green-600/20 text-green-400 border-green-600/30" },
      CANCELLED: { label: "Cancelado", className: "bg-red-600/20 text-red-400 border-red-600/30" },
      REFUNDED: { label: "Reembolsado", className: "bg-orange-600/20 text-orange-400 border-orange-600/30" },
    }
    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge className={config.className}>{config.label}</Badge>
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
                <h1 className="text-3xl font-bold text-white">Gestión de Pedidos y Transacciones</h1>
                <p className="text-zinc-400 mt-1">Monitorea y administra todos los pedidos de tu tienda</p>
              </div>
              <Link href="/dashboard/orders/add">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Pedido Manualmente
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Buscar por ID de pedido o cliente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Estado del Pedido" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white">
                      Todos los estados
                    </SelectItem>
                    <SelectItem value="PENDING" className="text-white">
                      Pendiente
                    </SelectItem>
                    <SelectItem value="PAID" className="text-white">
                      Pagado
                    </SelectItem>
                    <SelectItem value="PROCESSING" className="text-white">
                      Procesando
                    </SelectItem>
                    <SelectItem value="SHIPPED" className="text-white">
                      Enviado
                    </SelectItem>
                    <SelectItem value="DELIVERED" className="text-white">
                      Entregado
                    </SelectItem>
                    <SelectItem value="CANCELLED" className="text-white">
                      Cancelado
                    </SelectItem>
                    <SelectItem value="REFUNDED" className="text-white">
                      Reembolsado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading / Empty State */}
            {isLoading ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-400">Cargando órdenes...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-400">
                  {orders.length === 0
                    ? "No hay órdenes aún. Crea una para comenzar."
                    : "No se encontraron órdenes con los filtros aplicados."}
                </p>
              </div>
            ) : (
              <>
                {/* Transactions Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="text-zinc-400">ID de Pedido</TableHead>
                        <TableHead className="text-zinc-400">Cliente</TableHead>
                        <TableHead className="text-zinc-400">Total</TableHead>
                        <TableHead className="text-zinc-400">Items</TableHead>
                        <TableHead className="text-zinc-400">Estado</TableHead>
                        <TableHead className="text-zinc-400">Fecha</TableHead>
                        <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
                        <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell>
                            <Link
                              href={`/dashboard/transactions/${order.id}`}
                              className="text-pink-400 hover:text-pink-300 font-medium underline"
                            >
                              {order.order_number}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{order.users.name}</p>
                              <p className="text-xs text-zinc-500">{order.users.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {order.order_items.length} productos
                          </TableCell>
                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-zinc-400">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/transactions/${order.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                                  aria-label="Ver detalles de la orden"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                              </Link>
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
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de{" "}
                    {filteredOrders.length} órdenes
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
