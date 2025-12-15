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
  Filter,
} from "lucide-react";

const CATEGORIES_FIXED = [
  { id: "zapatillas", name: "Zapatillas", slug: "zapatillas" },
  { id: "botas", name: "Botas", slug: "botas" },
  { id: "botines", name: "Botines", slug: "botines" },
  { id: "pantuflas", name: "Pantuflas", slug: "pantuflas" },
  { id: "jeans", name: "Jeans", slug: "jeans" },
  { id: "accesorios", name: "Accesorios", slug: "accesorios" },
];

interface Supplier {
  id: string;
  name: string;
  email?: string;
  productCount?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
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

  const [categories] = useState<Category[]>(CATEGORIES_FIXED);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: "",
    supplierId: "",
    expectedDate: "",
    notes: "",
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  // Auth
  useEffect(() => {
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
    checkAuth();
  }, [router, supabase]);

  // Proveedores al cambiar categoría
  useEffect(() => {
    if (formData.categoryId) {
      fetchSuppliersForCategory();
    } else {
      setFilteredSuppliers([]);
    }
  }, [formData.categoryId]);

  // Productos cuando cambia categoría o proveedor
  useEffect(() => {
    if (formData.categoryId && formData.supplierId) {
      fetchProductsForCategory();
    } else {
      setAllProducts([]);
      setFilteredProducts([]);
      setItems([]);
    }
  }, [formData.categoryId, formData.supplierId]);

  // Sincronizar filtro de productos
  useEffect(() => {
    setFilteredProducts(allProducts);
  }, [allProducts]);

  // --------- FETCHS ---------

  const fetchSuppliersForCategory = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await fetch(
        `/api/purchases/suppliers-by-category?categorySlug=${formData.categoryId}`
      );
      const data = await res.json();
      if (data.success && data.data) {
        setFilteredSuppliers(data.data as Supplier[]);
      } else {
        setFilteredSuppliers([]);
      }
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setFilteredSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // API especial para órdenes: productos por categoría + info del proveedor, incluye stock 0
  const fetchProductsForCategory = async () => {
    if (!formData.categoryId || !formData.supplierId) {
      setAllProducts([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/purchases/products-for-orders?categorySlug=${formData.categoryId}&supplierId=${formData.supplierId}`
      );
      const data = await res.json();

      if (data.success && data.data) {
        const normalized: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock ?? 0,
          category: p.category,
          supplierCost: p.supplierCost,
          supplierSku: p.supplierSku,
          leadTimeDays: p.leadTimeDays,
          minimumOrderQty: p.minimumOrderQty,
        }));
        setAllProducts(normalized);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
      setAllProducts([]);
    }
  };

  // --------- MANEJO DE ITEMS ---------

  const handleAddProduct = (product: Product) => {
    const exists = items.find((item) => item.productId === product.id);
    if (exists) {
      alert("Este producto ya está en la orden");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: product.minimumOrderQty || 1,
        unitPrice: Number(product.supplierCost) || 0,
      },
    ]);
    setIsProductDialogOpen(false);
    setSearchProduct("");
  };

  const handleRemoveProduct = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleUpdateItem = (
    productId: string,
    field: "quantity" | "unitPrice",
    value: number
  ) => {
    setItems((prev) =>
      prev.map((item) =>
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

  // --------- SUBMIT ---------

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
          supplierId: formData.supplierId,
          expectedDate: formData.expectedDate,
          notes: formData.notes,
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

  // --------- DERIVADOS ---------

  const productsToShow = filteredProducts.filter((p) => {
    const searchLower = searchProduct.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.sku?.toLowerCase().includes(searchLower)
    );
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
        {/* HEADER */}
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
          {/* INFO ORDEN */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Información de la Orden
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Selecciona categoría y proveedor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CATEGORÍA */}
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-foreground">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      categoryId: value,
                      supplierId: "",
                    });
                    setItems([]);
                  }}
                >
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue placeholder="Selecciona una categoría primero" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.slug}
                        className="text-foreground"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PROVEEDOR */}
              <div className="space-y-2">
                <Label htmlFor="supplierId" className="text-foreground">
                  Proveedor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, supplierId: value });
                    setItems([]);
                  }}
                  disabled={!formData.categoryId || loadingSuppliers}
                >
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue
                      placeholder={
                        !formData.categoryId
                          ? "Selecciona categoría primero"
                          : loadingSuppliers
                          ? "Cargando proveedores..."
                          : filteredSuppliers.length === 0
                          ? "No hay proveedores para esta categoría"
                          : "Selecciona un proveedor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {filteredSuppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id}
                        className="text-foreground"
                      >
                        {supplier.name}
                        {supplier.productCount && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({supplier.productCount} productos)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FECHA */}
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

              {/* NOTAS */}
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

          {/* PRODUCTOS */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    Productos <span className="text-red-500">*</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {!formData.categoryId
                      ? "Selecciona una categoría primero"
                      : !formData.supplierId
                      ? "Selecciona un proveedor"
                      : `${filteredProducts.length} productos disponibles en ${
                          categories.find((c) => c.slug === formData.categoryId)
                            ?.name
                        }`}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsProductDialogOpen(true)}
                  disabled={
                    !formData.categoryId ||
                    !formData.supplierId ||
                    filteredProducts.length === 0
                  }
                  className="gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {!formData.categoryId || !formData.supplierId
                    ? "Completa categoría y proveedor"
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
                        <TableHead className="text-muted-foreground" />
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
                              min={1}
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
                              min={0}
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

          {/* TOTAL */}
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

          {/* ACCIONES */}
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

      {/* MODAL DE PRODUCTOS */}
      {isProductDialogOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsProductDialogOpen(false);
              setSearchProduct("");
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
                  {
                    categories.find((c) => c.slug === formData.categoryId)
                      ?.name
                  }{" "}
                  de{" "}
                  <span className="font-semibold text-pink-600">
                    {
                      filteredSuppliers.find(
                        (s) => s.id === formData.supplierId
                      )?.name
                    }
                  </span>
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsProductDialogOpen(false);
                  setSearchProduct("");
                }}
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
                  Mostrando: {productsToShow.length} de{" "}
                  {filteredProducts.length} productos
                </span>
                {filteredProducts.length > 0 && (
                  <span className="text-pink-600">
                    ✓ Los precios y cantidades mínimas se auto-completan
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto border border-border rounded-lg">
                {productsToShow.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {filteredProducts.length === 0
                      ? "No hay productos en esta categoría"
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
                        <TableHead className="text-muted-foreground w-28" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsToShow.map((product) => (
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
                              $
                              {Number(
                                product.supplierCost || 0
                              ).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {product.minimumOrderQty || "-"}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground text-xs">
                            {product.leadTimeDays
                              ? `${product.leadTimeDays}d`
                              : "-"}
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
                onClick={() => {
                  setIsProductDialogOpen(false);
                  setSearchProduct("");
                }}
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
