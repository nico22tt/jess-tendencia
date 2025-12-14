"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Input } from "@jess/ui/input";
import { Label } from "@jess/ui/label";
import { Textarea } from "@jess/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jess/ui/table";
import {
  ArrowLeft,
  Save,
  Loader2,
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  X,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  // ✅ Info del proveedor
  supplierCost?: number;
  supplierSku?: string;
  leadTimeDays?: number;
  minimumOrderQty?: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDate: "",
    notes: "",
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    checkAuth();
    fetchSuppliers();
  }, []);

  // ✅ Cargar productos cuando cambia el proveedor
  useEffect(() => {
    if (formData.supplierId) {
      fetchProducts();
    } else {
      setProducts([]);
      setItems([]); // Limpiar items al cambiar proveedor
    }
  }, [formData.supplierId]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login");
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/purchases/suppliers?isActive=true");
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchProducts = async () => {
    if (!formData.supplierId) {
      setProducts([]);
      return;
    }

    try {
      console.log("🔍 Cargando productos del proveedor:", formData.supplierId);

      const res = await fetch(
        `/api/products?supplierId=${formData.supplierId}`
      );

      if (!res.ok) {
        console.error("❌ HTTP Error:", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      console.log("📦 Respuesta API:", data);

      if (data.success && data.data) {
        console.log(`✅ ${data.data.length} productos del proveedor cargados`);
        setProducts(data.data);
      } else {
        console.error("❌ API error:", data.error || "Respuesta sin datos");
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error en fetch:", error);
      setProducts([]);
    }
  };

  const handleAddProduct = (product: Product) => {
    const exists = items.find((item) => item.productId === product.id);
    if (exists) {
      alert("Este producto ya está en la orden");
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: product.minimumOrderQty || 1, // ✅ Cantidad mínima
        unitPrice: Number(product.supplierCost) || 0, // ✅ Precio del proveedor
      },
    ]);
    setIsProductDialogOpen(false);
    setSearchProduct("");
  };

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleUpdateItem = (
    productId: string,
    field: "quantity" | "unitPrice",
    value: number
  ) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId) {
      alert("Debes seleccionar un proveedor");
      return;
    }

    if (items.length === 0) {
      alert("Debes agregar al menos un producto");
      return;
    }

    const invalidItems = items.filter(
      (item) => item.quantity <= 0 || item.unitPrice <= 0
    );
    if (invalidItems.length > 0) {
      alert("Todos los productos deben tener cantidad y precio mayores a 0");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/purchases/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Orden de compra creada correctamente");
        router.push(`/dashboard/purchases/purchase-orders/${data.data.id}`);
      } else {
        alert(data.error || "Error al crear orden");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear orden");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const searchLower = searchProduct.toLowerCase();
    const matchesName = p.name?.toLowerCase().includes(searchLower) || false;
    const matchesSku = p.sku?.toLowerCase().includes(searchLower) || false;
    return matchesName || matchesSku;
  });

  const { subtotal, tax, total } = calculateTotal();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    );
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
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
            <div className="p-3 bg-pink-600/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Nueva Orden de Compra
              </h1>
              <p className="text-muted-foreground mt-1">
                Crea una orden de compra a un proveedor
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Información de la Orden
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Datos generales de la orden de compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="supplierId" className="text-foreground">
                  Proveedor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, supplierId: value });
                    // Items se limpiarán automáticamente con useEffect
                  }}
                >
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id}
                        className="text-foreground"
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha Esperada */}
              <div className="space-y-2">
                <Label htmlFor="expectedDate" className="text-foreground">
                  Fecha Esperada de Entrega
                </Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedDate: e.target.value })
                  }
                  className="bg-card border-border text-foreground"
                />
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Información adicional sobre la orden..."
                  rows={3}
                  className="bg-card border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    Productos <span className="text-red-500">*</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {!formData.supplierId
                      ? "Selecciona un proveedor primero"
                      : `Productos de ${
                          suppliers.find((s) => s.id === formData.supplierId)
                            ?.name
                        }`}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsProductDialogOpen(true)}
                  disabled={!formData.supplierId}
                  className="gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {!formData.supplierId
                    ? "Selecciona un proveedor para comenzar"
                    : "No hay productos agregados"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">
                          Producto
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          SKU
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Cantidad
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Precio Unitario
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Subtotal
                        </TableHead>
                        <TableHead className="text-muted-foreground"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId} className="border-border">
                          <TableCell className="text-foreground">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {item.sku}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.productId,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-24 bg-card border-border text-foreground"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.productId,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-32 bg-card border-border text-foreground"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell className="text-foreground font-semibold">
                            ${(item.quantity * item.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(item.productId)}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA/Impuesto:</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-foreground pt-2 border-t border-border">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
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
              disabled={saving || items.length === 0}
              className="gap-2 bg-pink-600 hover:bg-pink-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Crear Orden
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ✅ MODAL CON INFO DEL PROVEEDOR */}
      {isProductDialogOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsProductDialogOpen(false);
            }
          }}
        >
          <div className="bg-card border border-border rounded-lg max-w-5xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Seleccionar Producto
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Productos de{" "}
                  <span className="font-semibold text-pink-600">
                    {suppliers.find((s) => s.id === formData.supplierId)?.name}
                  </span>
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsProductDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  autoFocus
                />
              </div>

              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Total: {products.length} | Mostrando: {filteredProducts.length}
                </span>
                {products.length > 0 && (
                  <span className="text-pink-600">
                    ✓ Los precios mostrados son específicos de este proveedor
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto border border-border rounded-lg">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {products.length === 0
                      ? "Este proveedor no tiene productos asociados"
                      : "No se encontraron productos con esa búsqueda"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">
                          Nombre
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          SKU
                        </TableHead>
                        <TableHead className="text-muted-foreground text-center">
                          Stock
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Costo Unitario
                        </TableHead>
                        <TableHead className="text-muted-foreground text-center">
                          Cant. Mín
                        </TableHead>
                        <TableHead className="text-muted-foreground text-center">
                          Entrega
                        </TableHead>
                        <TableHead className="text-muted-foreground w-28"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className="border-border hover:bg-muted/50"
                        >
                          <TableCell className="text-foreground font-medium">
                            <div>
                              <div>{product.name}</div>
                              {product.category && (
                                <div className="text-xs text-muted-foreground">
                                  {product.category.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">
                            {product.sku}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                (product.stock || 0) > 20
                                  ? "bg-green-500/10 text-green-600"
                                  : (product.stock || 0) > 0
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-red-500/10 text-red-600"
                              }`}
                            >
                              {product.stock ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-foreground">
                              ${Number(product.supplierCost || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {product.minimumOrderQty || "-"}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground text-xs">
                            {product.leadTimeDays ? `${product.leadTimeDays}d` : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                              className="bg-pink-600 hover:bg-pink-700 w-full"
                            >
                              Agregar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                💡 Tip: Los precios y cantidades mínimas se auto-completan
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductDialogOpen(false)}
                className="border-border text-foreground"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
