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
  ShoppingCart,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
  PackageCheck,
  DollarSign,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDate: string | null;
  supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  subtotal: string;
  tax: string;
  total: string;
  itemsCount: number;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
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

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Por Pagar",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  PAID: {
    label: "Pagada",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, filterStatus]);

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) {
        params.append("status", filterStatus);
      }

      const res = await fetch(`/api/purchases/orders?${params}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string, orderNumber: string) => {
    if (!confirm(`¿Cancelar orden ${orderNumber}?`)) return;

    try {
      const res = await fetch(`/api/purchases/orders/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("Orden cancelada correctamente");
        fetchOrders();
      } else {
        alert(data.error || "Error al cancelar orden");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cancelar orden");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="p-3 bg-pink-600/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Órdenes de Compra
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona las órdenes a proveedores
              </p>
            </div>
          </div>
          <Link href="/dashboard/purchases/purchase-orders/new">
            <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de orden o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              onClick={() => setFilterStatus(null)}
              className={
                filterStatus === null
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Todas
            </Button>
            <Button
              variant={filterStatus === "PENDING" ? "default" : "outline"}
              onClick={() => setFilterStatus("PENDING")}
              className={
                filterStatus === "PENDING"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Pendientes
            </Button>
            <Button
              variant={
                filterStatus === "PARTIALLY_RECEIVED" ? "default" : "outline"
              }
              onClick={() => setFilterStatus("PARTIALLY_RECEIVED")}
              className={
                filterStatus === "PARTIALLY_RECEIVED"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Parciales
            </Button>
            <Button
              variant={filterStatus === "RECEIVED" ? "default" : "outline"}
              onClick={() => setFilterStatus("RECEIVED")}
              className={
                filterStatus === "RECEIVED"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Recibidas
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Órdenes</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {orders.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Recibidas</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {orders.filter((o) => o.status === "RECEIVED").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Gastado</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              $
              {orders
                .filter((o) => o.status !== "CANCELLED")
                .reduce((sum, o) => sum + parseFloat(o.total), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-card">
                <TableHead className="text-muted-foreground">
                  Número Orden
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Proveedor
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Fecha Orden
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Items
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Estado
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Pago
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
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "No se encontraron órdenes"
                      : "No hay órdenes de compra registradas"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const statusCfg = statusConfig[order.status];
                  const paymentCfg = paymentStatusConfig[order.paymentStatus || "PENDING"];
                  
                  return (
                    <TableRow
                      key={order.id}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-foreground">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.supplier.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.orderDate).toLocaleDateString(
                            "es-CL"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          {order.itemsCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusCfg.color}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={paymentCfg.color}>
                          {paymentCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        ${parseFloat(order.total).toLocaleString()}
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
                            <Link
                              href={`/dashboard/purchases/purchase-orders/${order.id}`}
                            >
                              <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-muted">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            </Link>
                            {order.status === "PENDING" && (
                              <Link
                                href={`/dashboard/purchases/purchase-orders/${order.id}/edit`}
                              >
                                <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-muted">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {(order.status === "PENDING" ||
                              order.status === "PARTIALLY_RECEIVED") && (
                              <Link
                                href={`/dashboard/purchases/purchase-orders/${order.id}/receive`}
                              >
                                <DropdownMenuItem className="cursor-pointer text-green-400 hover:bg-green-500/10">
                                  <PackageCheck className="h-4 w-4 mr-2" />
                                  Recibir Mercadería
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {order.paymentStatus === "PENDING" &&
                              order.status !== "CANCELLED" && (
                                <Link
                                  href={`/dashboard/purchases/purchase-orders/${order.id}/pay`}
                                >
                                  <DropdownMenuItem className="cursor-pointer text-blue-400 hover:bg-blue-500/10">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Registrar Pago
                                  </DropdownMenuItem>
                                </Link>
                              )}
                            {order.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancel(order.id, order.orderNumber)
                                }
                                className="cursor-pointer text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
