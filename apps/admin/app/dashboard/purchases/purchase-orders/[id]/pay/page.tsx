"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Label } from "@jess/ui/label";
import { Textarea } from "@jess/ui/textarea";
import { Badge } from "@jess/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jess/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@jess/ui/card";
import {
  ArrowLeft,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Banknote,
  Building,
  FileCheck,
} from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  supplier: {
    name: string;
  };
  total: string;
}

const paymentMethods = [
  { value: "CASH", label: "Efectivo", icon: Banknote },
  { value: "TRANSFER", label: "Transferencia", icon: Building },
  { value: "CHECK", label: "Cheque", icon: FileCheck },
  { value: "CREDIT_CARD", label: "Tarjeta de Crédito", icon: CreditCard },
  { value: "DEBIT_CARD", label: "Tarjeta de Débito", icon: CreditCard },
  { value: "OTHER", label: "Otro", icon: DollarSign },
];

export default function PayPurchaseOrderPage({
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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

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
        router.push("/dashboardpurchases/purchase-orders");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar orden");
      router.push("/dashboard/purchases/purchase-orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Debes seleccionar un método de pago");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/purchases/orders/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Pago registrado correctamente");
        router.push(`/dashboard/purchases/purchase-orders/${id}`);
      } else {
        alert(data.error || "Error al registrar pago");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar pago");
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

  if (order.paymentStatus === "PAID") {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              Orden Ya Pagada
            </p>
            <p className="text-muted-foreground mb-4">
              Esta orden ya fue pagada anteriormente
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
              No se puede registrar pago de una orden cancelada
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
      <div className="space-y-6 max-w-3xl">
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
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Registrar Pago
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
                Registro de Pago
              </p>
              <p className="text-sm text-blue-300/80 mt-1">
                Al confirmar el pago, se actualizará el estado de pago de la
                orden a "Pagada" y se registrará la fecha y método de pago.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Amount */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">Monto a Pagar</CardTitle>
              <CardDescription className="text-muted-foreground">
                Total de la orden de compra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Total de la Orden
                </p>
                <p className="text-4xl font-bold text-foreground">
                  ${parseFloat(order.total).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Método de Pago <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Selecciona cómo se realizó el pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.value;
                  
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                        ${
                          isSelected
                            ? "border-pink-600 bg-pink-600/10"
                            : "border-border bg-card hover:border-muted-foreground/30"
                        }
                      `}
                    >
                      <div
                        className={`
                        p-2 rounded-lg
                        ${
                          isSelected
                            ? "bg-pink-600/20"
                            : "bg-muted"
                        }
                      `}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isSelected ? "text-pink-600" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-medium ${
                          isSelected ? "text-pink-600" : "text-foreground"
                        }`}
                      >
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Notas del Pago
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Información adicional sobre el pago (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Número de transferencia, cheque, comprobante, etc."
                rows={4}
                className="bg-card border-border text-foreground"
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Resumen del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orden:</span>
                <span className="text-foreground font-semibold">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proveedor:</span>
                <span className="text-foreground">{order.supplier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago:</span>
                <span className="text-foreground">
                  {paymentMethod
                    ? paymentMethods.find((m) => m.value === paymentMethod)
                        ?.label
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border">
                <span>Total a Pagar:</span>
                <span>${parseFloat(order.total).toLocaleString()}</span>
              </div>
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
              disabled={saving || !paymentMethod}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
