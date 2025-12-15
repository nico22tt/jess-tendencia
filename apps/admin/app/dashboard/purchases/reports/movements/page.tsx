"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Input } from "@jess/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jess/ui/select";
import {
  Activity,
  Search,
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  Download,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  currentStock?: number; // Opcional porque viene del API de movements
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: string | null;
  unitPrice: string | null;
  totalValue: string | null;
  referenceType: string | null;
  referenceId: string | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
}

const movementTypeConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  PURCHASE: {
    label: "Compra",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    icon: TrendingUp,
  },
  SALE: {
    label: "Venta",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: TrendingDown,
  },
  ADJUSTMENT: {
    label: "Ajuste",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Package,
  },
};

export default function MovementsReportPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user && selectedProduct !== "all") {
      fetchMovements();
    } else {
      setMovements([]);
      setCurrentProduct(null);
    }
  }, [user, selectedProduct, typeFilter]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    if (selectedProduct === "all") return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const res = await fetch(
        `/api/inventory/${selectedProduct}/movements?${params.toString()}`
      );

      if (!res.ok) {
        // opcional: loguear el cuerpo texto para debug
        const text = await res.text();
        console.error("Error response:", text);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setCurrentProduct(data.data.product);
        setMovements(data.data.movements);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleExport = () => {
    if (movements.length === 0 || !currentProduct) return;

    const csv = [
      [
        "Fecha",
        "Hora",
        "Tipo",
        "Cantidad",
        "Stock Anterior",
        "Stock Nuevo",
        "Costo Unit.",
        "Precio Unit.",
        "Valor Total",
        "Referencia",
        "Motivo",
        "Notas",
      ],
      ...movements.map((m) => {
        const date = new Date(m.createdAt);
        return [
          date.toLocaleDateString("es-CL"),
          date.toLocaleTimeString("es-CL"),
          movementTypeConfig[m.type]?.label || m.type,
          m.quantity,
          m.previousStock,
          m.newStock,
          m.unitCost || "-",
          m.unitPrice || "-",
          m.totalValue || "-",
          m.referenceType || "-",
          m.reason || "-",
          m.notes || "-",
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimientos-${currentProduct.sku}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Movimientos de Inventario
                </h1>
                <p className="text-muted-foreground mt-1">
                  Historial completo de entradas y salidas
                </p>
              </div>
            </div>
          </div>
          {movements.length > 0 && (
            <Button
              onClick={handleExport}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          )}
        </div>

        {/* Product Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Seleccionar Producto
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Elige un producto para ver su historial de movimientos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-96">
                <SelectItem value="all" className="text-foreground">
                  -- Selecciona un producto --
                </SelectItem>
                {filteredProducts.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.id}
                    className="text-foreground"
                  >
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Current Product Info */}
        {currentProduct && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Producto Seleccionado
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {currentProduct.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: {currentProduct.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Stock Actual</p>
                  <p className="text-3xl font-bold text-pink-600 mt-1">
                    {currentProduct.currentStock || currentProduct.stock || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {selectedProduct !== "all" && (
          <div className="flex gap-2">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              onClick={() => setTypeFilter("all")}
              className={
                typeFilter === "all"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Todos
            </Button>
            <Button
              variant={typeFilter === "PURCHASE" ? "default" : "outline"}
              onClick={() => setTypeFilter("PURCHASE")}
              className={
                typeFilter === "PURCHASE"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Compras
            </Button>
            <Button
              variant={typeFilter === "SALE" ? "default" : "outline"}
              onClick={() => setTypeFilter("SALE")}
              className={
                typeFilter === "SALE"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Ventas
            </Button>
            <Button
              variant={typeFilter === "ADJUSTMENT" ? "default" : "outline"}
              onClick={() => setTypeFilter("ADJUSTMENT")}
              className={
                typeFilter === "ADJUSTMENT"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "border-border"
              }
            >
              Ajustes
            </Button>
          </div>
        )}

        {/* Movements Table */}
        {selectedProduct !== "all" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Historial de Movimientos
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {movements.length} movimiento{movements.length !== 1 ? "s" : ""}{" "}
                registrado{movements.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hay movimientos registrados para este producto
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-card">
                        <TableHead className="text-muted-foreground">
                          Fecha y Hora
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Tipo
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Cantidad
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Stock Anterior
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Stock Nuevo
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Costo/Precio Unit.
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Valor Total
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Referencia
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Notas
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => {
                        const config = movementTypeConfig[movement.type];
                        const Icon = config?.icon || Activity;
                        const date = new Date(movement.createdAt);
                        const quantityColor =
                          movement.quantity > 0
                            ? "text-green-400"
                            : "text-red-400";

                        return (
                          <TableRow
                            key={movement.id}
                            className="border-border hover:bg-muted/50"
                          >
                            <TableCell className="text-muted-foreground">
                              <div>
                                <p className="font-medium">
                                  {date.toLocaleDateString("es-CL")}
                                </p>
                                <p className="text-sm">
                                  {date.toLocaleTimeString("es-CL")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={config.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${quantityColor}`}
                            >
                              {movement.quantity > 0 ? "+" : ""}
                              {movement.quantity}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-right">
                              {movement.previousStock}
                            </TableCell>
                            <TableCell className="text-foreground text-right font-semibold">
                              {movement.newStock}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-right">
                              {movement.unitCost
                                ? `$${parseFloat(movement.unitCost).toLocaleString()}`
                                : movement.unitPrice
                                ? `$${parseFloat(movement.unitPrice).toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-foreground text-right font-semibold">
                              {movement.totalValue
                                ? `$${parseFloat(movement.totalValue).toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {movement.referenceType
                                ? `${movement.referenceType}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">
                              {movement.notes || movement.reason || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedProduct === "all" && (
          <Card className="bg-card border-border">
            <CardContent className="py-12">
              <div className="text-center">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  Selecciona un Producto
                </p>
                <p className="text-muted-foreground">
                  Elige un producto del selector para ver su historial de
                  movimientos
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
