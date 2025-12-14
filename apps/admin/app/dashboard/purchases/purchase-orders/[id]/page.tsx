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
  PackageCheck,
  DollarSign,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
} from "lucide-react";
import Link from "next/link";

interface OrderDetail {
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
    address: string | null;
    taxId: string | null;
  };
  subtotal: string;
  tax: string;
  total: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: string | null;
  notes: string | null;
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      sku: string;
      currentStock: number;
    };
    quantityOrdered: number;
    quantityReceived: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  createdAt: string;
  updatedAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  PARTIALLY_RECEIVED: {
    label: "Parcialmente Recibida",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  RECEIVED: {
    label: "Recibida Completamente",
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

export default function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    checkAuth();
    fetchOrder();
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

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/purchases/orders/${id}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        alert("Error al cargar orden");
        router.push("/dashboard/purchases/purchase-orders");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar orden");
      router.push("/dashboard/purchases/purchase-orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm(`¿Cancelar orden ${order.orderNumber}?`)) return;

    try {
      const res = await fetch(`/api/purchases/orders/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("Orden cancelada correctamente");
        router.push("/dashboard/purchases/purchase-orders");
      } else {
        alert(data.error || "Error al cancelar orden");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cancelar orden");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Orden no encontrada</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  const statusCfg = statusConfig[order.status];
  const paymentCfg = paymentStatusConfig[order.paymentStatus];

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
                  {order.orderNumber}
                </h1>
                <Badge variant="outline" className={statusCfg.color}>
                  {statusCfg.label}
                </Badge>
                <Badge variant="outline" className={paymentCfg.color}>
                  {paymentCfg.label}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Orden creada el{" "}
                {new Date(order.createdAt).toLocaleDateString("es-CL")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {order.status === "PENDING" && (
              <Link href={`/dashboard/purchases/purchase-orders/${id}/edit`}>
                <Button variant="outline" className="gap-2 border-border">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
            )}
            {(order.status === "PENDING" ||
              order.status === "PARTIALLY_RECEIVED") && (
              <Link href={`/dashboard/purchases/purchase-orders/${id}/receive`}>
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <PackageCheck className="h-4 w-4" />
                  Recibir Mercadería
                </Button>
              </Link>
            )}
            {order.paymentStatus === "PENDING" &&
              order.status !== "CANCELLED" && (
                <Link href={`/dashboard/purchases/purchase-orders/${id}/pay`}>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <DollarSign className="h-4 w-4" />
                    Registrar Pago
                  </Button>
                </Link>
              )}
            {order.status === "PENDING" && (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-600/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Fecha Orden</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {new Date(order.orderDate).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Fecha Esperada
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {order.expectedDate
                      ? new Date(order.expectedDate).toLocaleDateString("es-CL")
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/10 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {order.items.length} producto
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    ${parseFloat(order.total).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Nombre</p>
                <Link href={`/dashboard/purchases/suppliers/${order.supplier.id}`}>
                  <p className="text-foreground font-semibold hover:text-pink-600 cursor-pointer">
                    {order.supplier.name}
                  </p>
                </Link>
              </div>
              {order.supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{order.supplier.email}</p>
                  </div>
                </div>
              )}
              {order.supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">{order.supplier.phone}</p>
                  </div>
                </div>
              )}
              {order.supplier.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="text-foreground">{order.supplier.address}</p>
                  </div>
                </div>
              )}
              {order.supplier.taxId && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">RUT/Tax ID</p>
                    <p className="text-foreground">{order.supplier.taxId}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Productos</CardTitle>
            <CardDescription className="text-muted-foreground">
              Detalle de los productos en esta orden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-card">
                  <TableHead className="text-muted-foreground">
                    Producto
                  </TableHead>
                  <TableHead className="text-muted-foreground">SKU</TableHead>
                  <TableHead className="text-muted-foreground">
                    Ordenado
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Recibido
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Pendiente
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Precio Unit.
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const pending =
                    item.quantityOrdered - item.quantityReceived;
                  return (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {item.product.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.product.sku}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.quantityOrdered}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.quantityReceived === item.quantityOrdered
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : item.quantityReceived > 0
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }
                        >
                          {item.quantityReceived}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pending}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${parseFloat(item.unitPrice).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        ${parseFloat(item.totalPrice).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals & Payment */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>${parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA/Impuesto:</span>
                <span>${parseFloat(order.tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
                <span>Total:</span>
                <span>${parseFloat(order.total).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="outline" className={paymentCfg.color}>
                  {paymentCfg.label}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="text-foreground">{order.paymentMethod}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de Pago:</span>
                  <span className="text-foreground">
                    {new Date(order.paidAt).toLocaleDateString("es-CL")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {order.notes && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {order.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
