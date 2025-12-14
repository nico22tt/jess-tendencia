"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@utils/supabase/client";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@jess/ui/button";
import { Input } from "@jess/ui/input";
import { Label } from "@jess/ui/label";
import { Textarea } from "@jess/ui/textarea";
import { Switch } from "@jess/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@jess/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
} from "lucide-react";

interface SupplierData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  isActive: boolean;
}

export default function EditSupplierPage({
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    isActive: true,
  });

  useEffect(() => {
    checkAuth();
    fetchSupplier();
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

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/purchases/suppliers/${id}`);
      const data = await res.json();

      if (data.success) {
        const supplier: SupplierData = data.data;
        setFormData({
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          taxId: supplier.taxId || "",
          isActive: supplier.isActive,
        });
      } else {
        alert("Error al cargar proveedor");
        router.push("/dashboard/purchases/suppliers");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar proveedor");
      router.push("/dashboard/purchases/suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("El nombre del proveedor es obligatorio");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/purchases/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("Proveedor actualizado correctamente");
        router.push(`/dashboard/purchases/suppliers/${id}`);
      } else {
        alert(data.error || "Error al actualizar proveedor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar proveedor");
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
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Editar Proveedor
              </h1>
              <p className="text-muted-foreground mt-1">
                Actualiza la información del proveedor
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Información del Proveedor
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Modifica los datos del proveedor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nombre del Proveedor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Distribuidora ABC"
                  required
                  className="bg-card border-border text-foreground"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacto@proveedor.com"
                  className="bg-card border-border text-foreground"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className="bg-card border-border text-foreground"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">
                  Dirección
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle 123, Ciudad, País"
                  rows={3}
                  className="bg-card border-border text-foreground"
                />
              </div>

              {/* RUT / Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-foreground">
                  RUT / Tax ID
                </Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="12.345.678-9"
                  className="bg-card border-border text-foreground"
                />
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-foreground">
                    Proveedor Activo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Desactiva el proveedor si ya no se usará
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
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
