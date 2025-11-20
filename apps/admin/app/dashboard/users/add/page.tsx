"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Switch } from "@jess/ui/switch"
import { Card } from "@jess/ui/card"
import { UserPlus } from "lucide-react"

export default function AddUserPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [isActive, setIsActive] = useState(true)

  const handleCreateUser = () => {
    // Validate passwords match
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    console.log("[v0] Creating user:", {
      fullName,
      email,
      password,
      role,
      phone,
      isActive,
    })
    alert("Usuario creado exitosamente (simulación)")
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-600/10 rounded-lg">
                <UserPlus className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Añadir Nuevo Usuario</h1>
                <p className="text-zinc-400 mt-1">Completa la información para crear un nuevo usuario</p>
              </div>
            </div>

            {/* Form Card */}
            <Card className="bg-zinc-900 border-zinc-800 p-8">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Información Personal</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-zinc-300">
                        Nombre Completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej: María González"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-zinc-300">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-zinc-300">
                        Teléfono <span className="text-zinc-500 text-sm">(Opcional)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="pt-6 border-t border-zinc-800">
                  <h2 className="text-xl font-semibold text-white mb-4">Seguridad</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password" className="text-zinc-300">
                        Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-zinc-300">
                        Confirmar Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Role Management Section */}
                <div className="pt-6 border-t border-zinc-800">
                  <h2 className="text-xl font-semibold text-white mb-4">Gestión de Roles</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role" className="text-zinc-300">
                        Rol del Usuario <span className="text-red-500">*</span>
                      </Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="admin" className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="font-medium">Administrador</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="client" className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="font-medium">Cliente</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-zinc-500 mt-2">
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
                <div className="pt-6 border-t border-zinc-800">
                  <h2 className="text-xl font-semibold text-white mb-4">Estado de la Cuenta</h2>
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div>
                      <Label htmlFor="isActive" className="text-zinc-300 font-medium">
                        Cuenta Activa
                      </Label>
                      <p className="text-sm text-zinc-500 mt-1">
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
                    onClick={handleCreateUser}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white text-lg py-6"
                    size="lg"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Crear Usuario
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
