"use client"

import { useEffect,useState } from "react"
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.data)
      })
  }, [])
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
    <div className="flex h-screen bg-background
">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground
">Gestión de Usuarios</h1>
                <p className="text-muted-foreground
 mt-1">Administra todos los usuarios de tu plataforma</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card
border border-border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground
" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted
 border-border text-foreground
 placeholder:text-muted-foreground
"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-muted
 border-border text-foreground
">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted
 border-border">
                    <SelectItem value="all" className="text-foreground
">
                      Todos los roles
                    </SelectItem>
                    <SelectItem value="admin" className="text-foreground
">
                      Admin
                    </SelectItem>
                    <SelectItem value="client" className="text-foreground
">
                      Cliente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card
border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted
/50">
                    <TableHead className="text-muted-foreground
">Nombre</TableHead>
                    <TableHead className="text-muted-foreground
">Email</TableHead>
                    <TableHead className="text-muted-foreground
">Rol</TableHead>
                    <TableHead className="text-muted-foreground
">Fecha de Registro</TableHead>
                    <TableHead className="text-muted-foreground
">Estado</TableHead>
                    <TableHead className="text-muted-foreground
 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted
/50">
                      <TableCell className="text-foreground
 font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground
">{user.email}</TableCell>
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
                      <TableCell className="text-muted-foreground
">{formatDate(user.registrationDate)}</TableCell>
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
                              className="border-border text-foreground
 hover:bg-muted
 bg-transparent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-red-400 hover:bg-muted
 hover:text-red-300 bg-transparent"
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
              <p className="text-sm text-muted-foreground
">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de{" "}
                {filteredUsers.length} usuarios
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground
 hover:bg-muted
 bg-transparent"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground
">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground
 hover:bg-muted
 bg-transparent"
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
