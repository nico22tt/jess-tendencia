"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Badge } from "@jess/ui/badge";
import { Input } from "@jess/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jess/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@jess/ui/dropdown-menu";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
}

export default function SuppliersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user, filterActive]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login");
      return;
    }
    setUser(user);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== null) {
        params.append("isActive", filterActive.toString());
      }

      const res = await fetch(`/api/purchases/suppliers?${params}`);
      const data = await res.json();

      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Desactivar proveedor "${name}"?`)) return;

    try {
      const res = await fetch(`/api/purchases/suppliers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("Proveedor desactivado correctamente");
        fetchSuppliers();
      } else {
        alert(data.error || "Error al desactivar proveedor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al desactivar proveedor");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    );
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Proveedores
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tu red de proveedores
              </p>
            </div>
          </div>
          <Link href="/dashboard/purchases/suppliers/new">
            <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterActive === null ? "default" : "outline"}
              onClick={() => setFilterActive(null)}
              className={
                filterActive === null
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Todos
            </Button>
            <Button
              variant={filterActive === true ? "default" : "outline"}
              onClick={() => setFilterActive(true)}
              className={
                filterActive === true
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Activos
            </Button>
            <Button
              variant={filterActive === false ? "default" : "outline"}
              onClick={() => setFilterActive(false)}
              className={
                filterActive === false
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Inactivos
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Proveedores</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {suppliers.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {suppliers.filter((s) => s.isActive).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Inactivos</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {suppliers.filter((s) => !s.isActive).length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-card">
                <TableHead className="text-muted-foreground">
                  Nombre
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Contacto
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Dirección
                </TableHead>
                <TableHead className="text-muted-foreground">
                  RUT/Tax ID
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Órdenes
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Estado
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "No se encontraron proveedores"
                      : "No hay proveedores registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="border-border hover:bg-muted/50"
                  >
                    <TableCell className="font-medium text-foreground">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="space-y-1">
                        {supplier.email && (
                          <p className="text-sm">{supplier.email}</p>
                        )}
                        {supplier.phone && (
                          <p className="text-sm">{supplier.phone}</p>
                        )}
                        {!supplier.email && !supplier.phone && (
                          <p className="text-sm italic">Sin contacto</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.address || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.taxId || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="bg-pink-500/10 text-pink-400 border-pink-500/20"
                      >
                        {supplier.totalOrders}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {supplier.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-400 border-green-500/20"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-400 border-red-500/20"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-card border-border"
                        >
                          <Link href={`/dashboard/purchases/suppliers/${supplier.id}`}>
                            <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-muted">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                          </Link>
                          <Link
                            href={`/dashboard/purchases/suppliers/${supplier.id}/edit`}
                          >
                            <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-muted">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          {supplier.isActive && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete(supplier.id, supplier.name)
                              }
                              className="cursor-pointer text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Desactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
