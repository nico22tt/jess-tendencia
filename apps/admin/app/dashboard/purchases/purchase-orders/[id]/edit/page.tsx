"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Input } from "@jess/ui/input";
import { Label } from "@jess/ui/label";
import { Textarea } from "@jess/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@jess/ui/dialog";
import {
  ArrowLeft,
  Save,
  Loader2,
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  expectedDate: string | null;
  notes: string | null;
  items: Array<{
    product: {
      id: string;
      name: string;
      sku: string;
    };
    quantityOrdered: number;
    quantityReceived: number;
    unitPrice: string;
  }>;
}

export default function EditPurchaseOrderPage({
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
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    expectedDate: "",
    notes: "",
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    checkAuth();
    fetchOrder();
    fetchProducts();
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
        setFormData({
          expectedDate: data.data.expectedDate
            ? data.data.expectedDate.split("T")[0]
            : "",
          notes: data.data.notes || "",
        });

        // Cargar items existentes
        setItems(
          data.data.items.map((item: any) => ({
            productId: item.product.id,
            productName: item.product.name,
            sku: item.product.sku,
            quantity: item.quantityOrdered,
            unitPrice: parseFloat(item.unitPrice),
          }))
        );
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
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
        quantity: 1,
        unitPrice: 0,
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

    if (!order) return;

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

      const res = await fetch(`/api/purchases/orders/${id}`, {
        method: "PUT",
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
        alert("Orden actualizada correctamente");
        router.push(`/dashboard/purchases/purchase-orders/${id}`);
      } else {
        alert(data.error || "Error al actualizar orden");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar orden");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const { subtotal, tax, total } = calculateTotal();

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

  if (order.status !== "PENDING") {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              No se puede editar esta orden
            </p>
            <p className="text-muted-foreground mb-4">
              Solo se pueden editar órdenes en estado PENDIENTE
            </p>
            <Button onClick={() => router.push(`/dashboard/purchases/purchase-orders/${id}`)}>
              Ver Detalle
            </Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Verificar si ya recibió mercadería
  const hasReceivedItems = order.items.some(
    (item) => item.quantityReceived > 0
  );

  if (hasReceivedItems) {
    return (
      <AdminDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              No se puede editar esta orden
            </p>
            <p className="text-muted-foreground mb-4">
              La orden ya tiene mercadería recibida
            </p>
            <Button onClick={() => router.push(`/dashboard/purchases/purchase-orders/${id}`)}>
              Ver Detalle
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
            <div className="p-3 bg-pink-600/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Editar Orden de Compra
              </h1>
              <p className="text-muted-foreground mt-1">
                {order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">
                Importante
              </p>
              <p className="text-sm text-yellow-300/80 mt-1">
                Al editar la orden, todos los items actuales serán reemplazados
                por los que definas aquí.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Order Info */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Información de la Orden
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Actualiza los datos de la orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    Productos <span className="text-red-500">*</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Modifica los productos de la orden
                  </CardDescription>
                </div>
                <Dialog
                  open={isProductDialogOpen}
                  onOpenChange={setIsProductDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className="gap-2 bg-pink-600 hover:bg-pink-700"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">
                        Seleccionar Producto
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar producto..."
                          value={searchProduct}
                          onChange={(e) => setSearchProduct(e.target.value)}
                          className="pl-10 bg-card border-border text-foreground"
                        />
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead className="text-muted-foreground">
                                Nombre
                              </TableHead>
                              <TableHead className="text-muted-foreground">
                                SKU
                              </TableHead>
                              <TableHead className="text-muted-foreground">
                                Stock
                              </TableHead>
                              <TableHead className="text-muted-foreground"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((product) => (
                              <TableRow
                                key={product.id}
                                className="border-border"
                              >
                                <TableCell className="text-foreground">
                                  {product.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {product.sku}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {product.stock}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleAddProduct(product)}
                                  >
                                    Agregar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay productos agregados
                </div>
              ) : (
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
                        <TableCell className="text-muted-foreground">
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
                            onClick={() =>
                              handleRemoveProduct(item.productId)
                            }
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="bg-card border-border mb-6">
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
              className="gap-2 bg-pink-600 hover:bg-pink-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
