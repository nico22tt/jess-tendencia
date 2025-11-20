"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Badge } from "@jess/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jess/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Plus, Search, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  orderId: string
  customer: string
  total: number
  orderStatus: "pending" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "paid" | "refunded" | "pending"
  orderDate: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    orderId: "ORD-2024-001",
    customer: "Valentina González",
    total: 89990,
    orderStatus: "delivered",
    paymentStatus: "paid",
    orderDate: "2024-03-15",
  },
  {
    id: "2",
    orderId: "ORD-2024-002",
    customer: "María Rodríguez",
    total: 125000,
    orderStatus: "shipped",
    paymentStatus: "paid",
    orderDate: "2024-03-18",
  },
  {
    id: "3",
    orderId: "ORD-2024-003",
    customer: "Carolina Silva",
    total: 67500,
    orderStatus: "pending",
    paymentStatus: "pending",
    orderDate: "2024-03-20",
  },
  {
    id: "4",
    orderId: "ORD-2024-004",
    customer: "Sofía Martínez",
    total: 45000,
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    orderDate: "2024-03-12",
  },
  {
    id: "5",
    orderId: "ORD-2024-005",
    customer: "Isabella Torres",
    total: 98000,
    orderStatus: "delivered",
    paymentStatus: "paid",
    orderDate: "2024-03-10",
  },
  {
    id: "6",
    orderId: "ORD-2024-006",
    customer: "Camila López",
    total: 156000,
    orderStatus: "shipped",
    paymentStatus: "paid",
    orderDate: "2024-03-19",
  },
  {
    id: "7",
    orderId: "ORD-2024-007",
    customer: "Fernanda Pérez",
    total: 72000,
    orderStatus: "pending",
    paymentStatus: "paid",
    orderDate: "2024-03-21",
  },
  {
    id: "8",
    orderId: "ORD-2024-008",
    customer: "Daniela Castro",
    total: 134500,
    orderStatus: "delivered",
    paymentStatus: "paid",
    orderDate: "2024-03-08",
  },
  {
    id: "9",
    orderId: "ORD-2024-009",
    customer: "Valentina González",
    total: 89000,
    orderStatus: "shipped",
    paymentStatus: "paid",
    orderDate: "2024-03-17",
  },
  {
    id: "10",
    orderId: "ORD-2024-010",
    customer: "María Rodríguez",
    total: 112000,
    orderStatus: "pending",
    paymentStatus: "pending",
    orderDate: "2024-03-22",
  },
]

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesOrderStatus = orderStatusFilter === "all" || transaction.orderStatus === orderStatusFilter
    const matchesPaymentStatus = paymentStatusFilter === "all" || transaction.paymentStatus === paymentStatusFilter
    return matchesSearch && matchesOrderStatus && matchesPaymentStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" },
      shipped: { label: "Enviado", className: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
      delivered: { label: "Entregado", className: "bg-green-600/20 text-green-400 border-green-600/30" },
      cancelled: { label: "Cancelado", className: "bg-red-600/20 text-red-400 border-red-600/30" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Pagado", className: "bg-green-600/20 text-green-400 border-green-600/30" },
      refunded: { label: "Reembolsado", className: "bg-orange-600/20 text-orange-400 border-orange-600/30" },
      pending: { label: "Pendiente", className: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
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
              <Link href="/admin/orders/add">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Pedido Manualmente
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
                    <SelectItem value="pending" className="text-white">
                      Pendiente
                    </SelectItem>
                    <SelectItem value="shipped" className="text-white">
                      Enviado
                    </SelectItem>
                    <SelectItem value="delivered" className="text-white">
                      Entregado
                    </SelectItem>
                    <SelectItem value="cancelled" className="text-white">
                      Cancelado
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Estado del Pago" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white">
                      Todos los pagos
                    </SelectItem>
                    <SelectItem value="paid" className="text-white">
                      Pagado
                    </SelectItem>
                    <SelectItem value="refunded" className="text-white">
                      Reembolsado
                    </SelectItem>
                    <SelectItem value="pending" className="text-white">
                      Pendiente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableHead className="text-zinc-400">ID de Pedido</TableHead>
                    <TableHead className="text-zinc-400">Cliente</TableHead>
                    <TableHead className="text-zinc-400">Total de la Orden</TableHead>
                    <TableHead className="text-zinc-400">Estado del Pedido</TableHead>
                    <TableHead className="text-zinc-400">Estado del Pago</TableHead>
                    <TableHead className="text-zinc-400">Fecha de Pedido</TableHead>
                    <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell>
                        <Link
                          href={`/admin/transactions/${transaction.id}`}
                          className="text-pink-400 hover:text-pink-300 font-medium underline"
                        >
                          {transaction.orderId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-white font-medium">{transaction.customer}</TableCell>
                      <TableCell className="text-zinc-400">{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>{getOrderStatusBadge(transaction.orderStatus)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(transaction.paymentStatus)}</TableCell>
                      <TableCell className="text-zinc-400">{formatDate(transaction.orderDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/transactions/${transaction.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Cambiar Estado
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} de{" "}
                {filteredTransactions.length} transacciones
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
