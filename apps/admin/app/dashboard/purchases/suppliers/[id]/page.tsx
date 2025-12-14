"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Badge } from "@jess/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@jess/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jess/ui/table";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShoppingCart,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface SupplierDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  totalOrders: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    orderDate: string;
  }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  PARTIALLY_RECEIVED: {
    label: "Parcial",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  RECEIVED: {
    label: "Recibida",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);

  useEffect(() => {
    checkAuth();
    fetchSupplier();
  }, [id]);

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

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/purchases/suppliers/${id}`);
      const data = await res.json();

      if (data.success) {
        setSupplier(data.data);
      } else {
        alert("Error al cargar proveedor");
        router.push("/dashboard/purchases/suppliers");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar proveedor");
      router.push("/dashboard/purchases/suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplier) return;
    if (!confirm(`¿Desactivar proveedor "${supplier.name}"?`)) return;

    try {
      const res = await fetch(`/api/purchases/suppliers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("Proveedor desactivado correctamente");
        router.push("/dashboard/purchases/suppliers");
      } else {
        alert(data.error || "Error al desactivar proveedor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al desactivar proveedor");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Proveedor no encontrado</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-zinc-700 text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {supplier.name}
                </h1>
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
              </div>
              <p className="text-muted-foreground mt-1">
                Información completa del proveedor
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {supplier.isActive && (
              <Link href={`/dashboard/purchases/suppliers/${id}/edit`}>
                <Button variant="outline" className="gap-2 border-border">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
            )}
            {supplier.isActive && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Desactivar
              </Button>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {supplier.email || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/10 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {supplier.phone || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm font-medium text-foreground mt-1 truncate">
                    {supplier.address || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600/10 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">RUT / Tax ID</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {supplier.taxId || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-600/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Órdenes
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {supplier.totalOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/10 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de Registro
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {new Date(supplier.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Órdenes Recientes
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimas 10 órdenes de compra de este proveedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {supplier.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay órdenes registradas
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-card">
                    <TableHead className="text-muted-foreground">
                      Número de Orden
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Fecha
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Estado
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Total
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplier.recentOrders.map((order) => {
                    const config = statusConfig[order.status];
                    return (
                      <TableRow
                        key={order.id}
                        className="border-border hover:bg-muted/50"
                      >
                        <TableCell className="font-medium text-foreground">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString(
                            "es-CL"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground font-semibold">
                          ${parseFloat(order.total).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/purchases/purchase-orders/${order.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
