"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Input } from "@jess/ui/input";
import { Label } from "@jess/ui/label";
import { Textarea } from "@jess/ui/textarea";
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
  PackageCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface OrderItem {
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
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  supplier: {
    name: string;
  };
  items: OrderItem[];
}

export default function ReceivePurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [notes, setNotes] = useState("");
  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<string, number>
  >({});

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
        // Inicializar cantidades con lo pendiente de cada item
        const initialQuantities: Record<string, number> = {};
        data.data.items.forEach((item: OrderItem) => {
          const pending = item.quantityOrdered - item.quantityReceived;
          initialQuantities[item.id] = pending;
        });
        setReceivedQuantities(initialQuantities);
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

  const handleQuantityChange = (itemId: string, value: number) => {
    setReceivedQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order) return;

    // Validar que al menos un item tenga cantidad > 0
    const itemsToReceive = Object.entries(receivedQuantities).filter(
      ([_, qty]) => qty > 0
    );

    if (itemsToReceive.length === 0) {
      alert("Debes recibir al menos un producto");
      return;
    }

    // Validar que no se exceda la cantidad pendiente
    const invalidItems = itemsToReceive.filter(([itemId, qty]) => {
      const item = order.items.find((i) => i.id === itemId);
      if (!item) return false;
      const pending = item.quantityOrdered - item.quantityReceived;
      return qty > pending;
    });

    if (invalidItems.length > 0) {
      alert("No puedes recibir más de lo pendiente en algunos productos");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/purchases/orders/${id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToReceive.map(([itemId, qty]) => ({
            itemId,
            quantityReceived: qty,
          })),
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `Mercadería recibida correctamente. Estado: ${data.data.newStatus}`
        );
        router.push(`/dashboard/purchases/purchase-orders/${id}`);
      } else {
        alert(data.error || "Error al recibir mercadería");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al recibir mercadería");
    } finally {
      setSaving(false);
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

  if (order.status === "RECEIVED") {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              Orden Completamente Recibida
            </p>
            <p className="text-muted-foreground mb-4">
              Esta orden ya fue recibida en su totalidad
            </p>
            <Button onClick={() => router.push(`/dashboard/purchases/purchase-orders/${id}`)}>
              Ver Detalle
            </Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (order.status === "CANCELLED") {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              Orden Cancelada
            </p>
            <p className="text-muted-foreground mb-4">
              No se puede recibir mercadería de una orden cancelada
            </p>
            <Button onClick={() => router.push("/dashboard/purchases/purchase-orders")}>
              Volver al Listado
            </Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="border-zinc-700 text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600/10 rounded-lg">
              <PackageCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Recibir Mercadería
              </h1>
              <p className="text-muted-foreground mt-1">
                Orden {order.orderNumber} - {order.supplier.name}
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">
                Recepción de Mercadería
              </p>
              <p className="text-sm text-blue-300/80 mt-1">
                Ingresa las cantidades recibidas. Puedes hacer recepción
                parcial. El stock y costos se actualizarán automáticamente.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Items */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Productos a Recibir
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa la cantidad recibida para cada producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-card">
                    <TableHead className="text-muted-foreground">
                      Producto
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      SKU
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Stock Actual
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Ordenado
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Ya Recibido
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Pendiente
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Recibir Ahora
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Precio Unit.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => {
                    const pending =
                      item.quantityOrdered - item.quantityReceived;
                    const receivingNow = receivedQuantities[item.id] || 0;

                    return (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          {item.product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.product.sku}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                          >
                            {item.product.currentStock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.quantityOrdered}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.quantityReceived > 0
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }
                          >
                            {item.quantityReceived}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-orange-500/10 text-orange-400 border-orange-500/20"
                          >
                            {pending}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={pending}
                            value={receivingNow}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-24 bg-card border-border text-foreground"
                            disabled={pending === 0}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          ${parseFloat(item.unitPrice).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Resumen de Recepción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Productos a recibir:</span>
                  <span>
                    {
                      Object.values(receivedQuantities).filter((qty) => qty > 0)
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Unidades totales:</span>
                  <span>
                    {Object.values(receivedQuantities).reduce(
                      (sum, qty) => sum + qty,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-foreground pt-2 border-t border-border">
                  <span>Valor estimado:</span>
                  <span>
                    $
                    {order.items
                      .reduce((sum, item) => {
                        const qty = receivedQuantities[item.id] || 0;
                        return (
                          sum + qty * parseFloat(item.unitPrice)
                        );
                      }, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">Notas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Comentarios adicionales sobre la recepción (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Producto llegó en perfectas condiciones, Faltó 1 unidad del producto X, etc."
                rows={4}
                className="bg-card border-border text-foreground"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4" />
                  Confirmar Recepción
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
