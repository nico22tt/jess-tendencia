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
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "client"
  registrationDate: string
  status: "active" | "inactive"
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Valentina González",
    email: "valentina@example.com",
    role: "client",
    registrationDate: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "María Rodríguez",
    email: "maria@example.com",
    role: "client",
    registrationDate: "2024-02-20",
    status: "active",
  },
  {
    id: "3",
    name: "Admin Principal",
    email: "admin@test.com",
    role: "admin",
    registrationDate: "2023-12-01",
    status: "active",
  },
  {
    id: "4",
    name: "Carolina Silva",
    email: "carolina@example.com",
    role: "client",
    registrationDate: "2024-03-10",
    status: "active",
  },
  {
    id: "5",
    name: "Sofía Martínez",
    email: "sofia@example.com",
    role: "client",
    registrationDate: "2024-01-28",
    status: "inactive",
  },
  {
    id: "6",
    name: "Isabella Torres",
    email: "isabella@example.com",
    role: "client",
    registrationDate: "2024-02-14",
    status: "active",
  },
  {
    id: "7",
    name: "Camila López",
    email: "camila@example.com",
    role: "client",
    registrationDate: "2024-03-05",
    status: "active",
  },
  {
    id: "8",
    name: "Admin Secundario",
    email: "admin2@test.com",
    role: "admin",
    registrationDate: "2024-01-10",
    status: "active",
  },
  {
    id: "9",
    name: "Fernanda Pérez",
    email: "fernanda@example.com",
    role: "client",
    registrationDate: "2024-02-25",
    status: "active",
  },
  {
    id: "10",
    name: "Daniela Castro",
    email: "daniela@example.com",
    role: "client",
    registrationDate: "2024-03-12",
    status: "inactive",
  },
]

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-zinc-400 mt-1">Administra todos los usuarios de tu plataforma</p>
              </div>
              <Link href="/dashboard/users/add">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Añadir Nuevo Usuario
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
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white">
                      Todos los roles
                    </SelectItem>
                    <SelectItem value="admin" className="text-white">
                      Admin
                    </SelectItem>
                    <SelectItem value="client" className="text-white">
                      Cliente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableHead className="text-zinc-400">Nombre</TableHead>
                    <TableHead className="text-zinc-400">Email</TableHead>
                    <TableHead className="text-zinc-400">Rol</TableHead>
                    <TableHead className="text-zinc-400">Fecha de Registro</TableHead>
                    <TableHead className="text-zinc-400">Estado</TableHead>
                    <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-zinc-400">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "admin"
                              ? "bg-purple-600/20 text-purple-400 border-purple-600/30"
                              : "bg-blue-600/20 text-blue-400 border-blue-600/30"
                          }
                        >
                          {user.role === "admin" ? "Admin" : "Cliente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">{formatDate(user.registrationDate)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-600/20 text-green-400 border-green-600/30"
                              : "bg-red-600/20 text-red-400 border-red-600/30"
                          }
                        >
                          {user.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/users/edit/${user.id}`}>
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de{" "}
                {filteredUsers.length} usuarios
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
