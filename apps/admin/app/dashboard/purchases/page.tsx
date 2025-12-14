"use client";

import { useState, useEffect } from "react";
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
  ShoppingCart,
  Users,
  DollarSign,
  AlertCircle,
  Package,
  TrendingUp,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface PurchaseStats {
  summary: {
    totalSpent: string;
    activeSuppliers: number;
    pendingPayment: {
      count: number;
      amount: string;
    };
  };
  ordersByStatus: Array<{
    status: string;
    count: number;
    total: string;
  }>;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    totalOrders: number;
    totalAmount: string;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    totalReceived: number;
    orderCount: number;
  }>;
}

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
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

export default function PurchasesDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PurchaseStats | null>(null);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchases/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

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
                Gestión de Compras
              </h1>
              <p className="text-muted-foreground mt-1">
                Control de proveedores, órdenes y costos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/purchases/suppliers/new">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Nuevo Proveedor
              </Button>
            </Link>
            <Link href="/dashboard/purchases/purchase-orders/new">
              <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4" />
                Nueva Orden de Compra
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gastado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${parseFloat(stats?.summary.totalSpent || "0").toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En todas las órdenes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proveedores Activos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.summary.activeSuppliers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Proveedores disponibles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos Pendientes
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.summary.pendingPayment.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${parseFloat(stats?.summary.pendingPayment.amount || "0").toLocaleString()} por pagar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Órdenes Activas
              </CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.ordersByStatus
                  .filter((s) => s.status !== "CANCELLED")
                  .reduce((acc, s) => acc + s.count, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En proceso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders by Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Órdenes por Estado</CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribución de órdenes de compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.ordersByStatus.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.count} orden{item.count !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ${parseFloat(item.total).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Suppliers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-600" />
                Top Proveedores
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Por monto total de compras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-card">
                    <TableHead className="text-muted-foreground">
                      Proveedor
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Órdenes
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier.supplierId}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-foreground">
                        {supplier.supplierName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {supplier.totalOrders}
                      </TableCell>
                      <TableCell className="text-foreground text-right font-semibold">
                        ${parseFloat(supplier.totalAmount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Productos Más Comprados
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-card">
                    <TableHead className="text-muted-foreground">
                      Producto
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Recibido
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topProducts.map((product) => (
                    <TableRow
                      key={product.productId}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {product.productName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground text-right font-semibold">
                        {product.totalReceived} unidades
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/purchases/suppliers">
            <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Gestión de Proveedores
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ver y administrar proveedores
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/purchases/purchase-orders">
            <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-pink-600" />
                  Órdenes de Compra
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ver todas las órdenes
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/purchases/reports/stock-value">
            <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Reportes
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Valorización y análisis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
