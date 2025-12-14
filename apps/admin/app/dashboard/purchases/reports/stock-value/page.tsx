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
  DollarSign,
  Package,
  TrendingUp,
  Search,
  Loader2,
  Download,
  ArrowLeft,
} from "lucide-react";

interface ProductValue {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  averageCost: string;
  lastCost: string;
  basePrice: string;
  stockValue: string;
  potentialRevenue: string;
  potentialProfit: string;
  profitMargin: string;
}

interface ReportData {
  summary: {
    totalProducts: number;
    totalStockValue: string;
    totalPotentialRevenue: string;
    totalPotentialProfit: string;
    averageMargin: string;
  };
  products: ProductValue[];
}

export default function StockValueReportPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReport();
    }
  }, [user, categoryFilter]);

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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.append("categoryId", categoryFilter);
      }

      const res = await fetch(`/api/purchases/reports/stock-value?${params}`);
      const data = await res.json();

      if (data.success) {
        setReport(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;

    const csv = [
      [
        "SKU",
        "Producto",
        "Categoría",
        "Stock",
        "Costo Promedio",
        "Último Costo",
        "Precio Base",
        "Valor Stock",
        "Ingreso Potencial",
        "Ganancia Potencial",
        "Margen %",
      ],
      ...report.products.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.stock,
        p.averageCost,
        p.lastCost,
        p.basePrice,
        p.stockValue,
        p.potentialRevenue,
        p.potentialProfit,
        p.profitMargin,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valorizacion-inventario-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredProducts = report?.products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
              <div className="p-3 bg-green-600/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Valorización de Inventario
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análisis de valor y rentabilidad del stock
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleExport}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Summary Cards */}
        {report && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total del Stock
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${parseFloat(report.summary.totalStockValue).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Costo promedio × stock
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingreso Potencial
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${parseFloat(report.summary.totalPotentialRevenue).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Si se vende todo el stock
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ganancia Potencial
                </CardTitle>
                <DollarSign className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${parseFloat(report.summary.totalPotentialProfit).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Utilidad bruta estimada
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Margen Promedio
                </CardTitle>
                <Package className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {report.summary.averageMargin}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.summary.totalProducts} productos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-64 bg-card border-border text-foreground">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground">
                Todas las categorías
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="text-foreground"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Detalle por Producto
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Valorización individual de cada producto en stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-card">
                    <TableHead className="text-muted-foreground">
                      Producto
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Categoría
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Stock
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Costo Prom.
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Último Costo
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Precio Base
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Valor Stock
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Ing. Potencial
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Ganancia Pot.
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Margen %
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "No se encontraron productos"
                          : "No hay productos con stock"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const margin = parseFloat(product.profitMargin);
                      const marginColor =
                        margin >= 30
                          ? "text-green-400"
                          : margin >= 15
                          ? "text-yellow-400"
                          : "text-red-400";

                      return (
                        <TableRow
                          key={product.id}
                          className="border-border hover:bg-muted/50"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                            >
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground text-right font-semibold">
                            {product.stock}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            ${parseFloat(product.averageCost).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            ${parseFloat(product.lastCost).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            ${parseFloat(product.basePrice).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-foreground text-right font-semibold">
                            ${parseFloat(product.stockValue).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-blue-400 text-right font-semibold">
                            $
                            {parseFloat(
                              product.potentialRevenue
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-green-400 text-right font-semibold">
                            $
                            {parseFloat(
                              product.potentialProfit
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${marginColor}`}
                          >
                            {product.profitMargin}%
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
