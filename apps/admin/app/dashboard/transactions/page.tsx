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
import { 
  Plus, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string // ✅ camelCase
  status: string
  total: number
  createdAt: string // ✅ camelCase
  users: {
    id: string
    name: string
    email: string
  } | null // ✅ Permitir null
  orderItems: Array<{ // ✅ camelCase
    id: string
    quantity: number
    unitPrice: number // ✅ camelCase
    products: {
      id: string
      name: string
    }
  }>
}

export default function TransactionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [orderStatusFilter])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
  }

  // Cargar órdenes desde la API
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
        console.log('📦 Primera orden:', data.data[0]) // ✅ Debug
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

  // Filtrar órdenes
  const filteredOrders = orders.filter((order) => {
    // ✅ Proteger contra usuarios null
    const userName = order.users?.name || 'Usuario desconocido'
    const userEmail = order.users?.email || ''
    
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  // Estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }

  // ✅ Mejorar formatDate para manejar diferentes tipos
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Fecha no disponible'
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString
      
      if (isNaN(date.getTime())) {
        return 'Fecha inválida'
      }
      
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return 'Fecha inválida'
    }
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-600/10 rounded-lg">
              <Package className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Pedidos</h1>
              <p className="text-muted-foreground mt-1">Monitorea y administra todos los pedidos de tu tienda</p>
            </div>
          </div>
          <Link href="/dashboard/orders/add">
            <Button className="bg-pink-600 hover:bg-pink-700 text-foreground">
              <Plus className="h-5 w-5 mr-2" />
              Crear Pedido Manual
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Órdenes</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-zinc-600" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enviadas</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entregadas</p>
                  <p className="text-2xl font-bold text-green-400">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por ID de pedido o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Estado del Pedido" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="all" className="text-foreground">
                  Todos los estados
                </SelectItem>
                <SelectItem value="PENDING" className="text-foreground">
                  Pendiente
                </SelectItem>
                <SelectItem value="PAID" className="text-foreground">
                  Pagado
                </SelectItem>
                <SelectItem value="PROCESSING" className="text-foreground">
                  Procesando
                </SelectItem>
                <SelectItem value="SHIPPED" className="text-foreground">
                  Enviado
                </SelectItem>
                <SelectItem value="DELIVERED" className="text-foreground">
                  Entregado
                </SelectItem>
                <SelectItem value="CANCELLED" className="text-foreground">
                  Cancelado
                </SelectItem>
                <SelectItem value="REFUNDED" className="text-foreground">
                  Reembolsado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading / Empty State */}
        {isLoading ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Loader2 className="h-8 w-8 text-pink-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando órdenes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No hay órdenes
            </h3>
            <p className="text-muted-foreground">
              {orders.length === 0
                ? "No hay órdenes registradas aún."
                : "No se encontraron órdenes con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            {/* Transactions Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-zinc-900">
                    <TableHead className="text-muted-foreground">ID de Pedido</TableHead>
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Total</TableHead>
                    <TableHead className="text-muted-foreground">Items</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <Link
                          href={`/dashboard/transactions/${order.id}`}
                          className="text-pink-400 hover:text-pink-300 font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-foreground font-medium">
                            {order.users?.name || 'Usuario desconocido'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.users?.email || 'Sin email'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.orderItems.length} {order.orderItems.length === 1 ? 'producto' : 'productos'}
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/transactions/${order.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-foreground hover:bg-muted bg-transparent"
                            aria-label="Ver detalles de la orden"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de{" "}
                {filteredOrders.length} {filteredOrders.length === 1 ? 'orden' : 'órdenes'}
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
