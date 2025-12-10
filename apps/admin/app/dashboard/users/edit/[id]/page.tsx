"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Switch } from "@jess/ui/switch"
import { Card } from "@jess/ui/card"
import { Edit } from "lucide-react"

// params ahora es: { params: Promise<{ id: string }> }
export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) // ✅ Next.js 15+: usar use(params)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [isActive, setIsActive] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFullName(data.data.name)
          setEmail(data.data.email)
          setRole(data.data.role)
          setPhone(data.data.phone ?? "")
          setIsActive(data.data.isActive ?? true)
        }
      })
  }, [id])

  const handleEditUser = async () => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        role,
        phone,
        isActive
      })
    })
    const result = await res.json()
    if (result.success) {
      alert("Usuario editado exitosamente")
      router.push("/dashboard/users")
    } else {
      alert("Error al editar usuario: " + (result.error || ""))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-600/10 rounded-lg">
                <Edit className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Editar Usuario</h1>
                <p className="text-muted-foreground mt-1">Modifica la información del usuario</p>
              </div>
            </div>
            {/* Form Card */}
            <Card className="bg-card border-border p-8">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h2 className="text-xl font-semibold text-foregroundmb-4">Información Personal</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-foreground">
                        Nombre Completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Ej: María González"
                        className="bg-muted border-border text-foregroundplaceholder:text-muted-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                        className="bg-muted border-border text-foregroundplaceholder:text-muted-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Teléfono <span className="text-muted-foreground text-sm">(Opcional)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="bg-muted border-border text-foregroundplaceholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
                {/* Role Management Section */}
                <div className="pt-6 border-t border-border">
                  <h2 className="text-xl font-semibold text-foregroundmb-4">Gestión de Roles</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role" className="text-foreground">
                        Rol del Usuario <span className="text-red-500">*</span>
                      </Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent className="bg-muted border-border">
                          <SelectItem value="admin" className="text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="font-medium">Administrador</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="client" className="text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="font-medium">Cliente</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-2">
                        {role === "admin"
                          ? "Los administradores tienen acceso completo al panel de administración"
                          : role === "client"
                          ? "Los clientes solo pueden acceder a la tienda y gestionar sus pedidos"
                          : "Selecciona el nivel de acceso para este usuario"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Account Status Section */}
                <div className="pt-6 border-t border-border">
                  <h2 className="text-xl font-semibold text-foregroundmb-4">Estado de la Cuenta</h2>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="isActive" className="text-foreground font-medium">
                        Cuenta Activa
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isActive
                          ? "El usuario puede iniciar sesión y acceder al sistema"
                          : "El usuario no podrá iniciar sesión"}
                      </p>
                    </div>
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>
                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleEditUser}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-foregroundtext-lg py-6"
                    size="lg"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
