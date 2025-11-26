"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Textarea } from "@jess/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jess/ui/card"
import { Separator } from "@jess/ui/separator"
import { ArrowLeft, Save, Package, Loader2, TrendingUp, AlertTriangle } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  category: string
  minStock: number
}

export default function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  
  // Estados del formulario
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add")
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")
  const [newMinStock, setNewMinStock] = useState("")

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/inventory`)
      const data = await res.json()

      if (data.success) {
        const foundProduct = data.data.find((p: Product) => p.id === id)
        if (foundProduct) {
          setProduct(foundProduct)
          setNewMinStock(foundProduct.minStock.toString())
        } else {
          alert("Producto no encontrado")
          router.back()
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar producto")
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!product || !adjustmentAmount) {
      alert("Por favor ingresa una cantidad válida")
      return
    }

    const amount = parseInt(adjustmentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("La cantidad debe ser un número positivo")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/inventory/${product.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: adjustmentType,
          amount,
          note: adjustmentNote
        })
      })

      const result = await res.json()

      if (result.success) {
        alert("Stock ajustado exitosamente")
        // Recargar datos del producto
        await fetchProduct()
        // Reset form
        setAdjustmentAmount("")
        setAdjustmentNote("")
      } else {
        alert("Error al ajustar stock: " + (result.error || ""))
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al ajustar stock")
    } finally {
      setSaving(false)
    }
  }

  const calculateNewStock = () => {
    if (!product || !adjustmentAmount) return product?.stock || 0

    const amount = parseInt(adjustmentAmount)
    if (isNaN(amount)) return product.stock

    let newStock = product.stock

    if (adjustmentType === "add") {
      newStock += amount
    } else if (adjustmentType === "subtract") {
      newStock = Math.max(0, newStock - amount)
    } else if (adjustmentType === "set") {
      newStock = amount
    }

    return newStock
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-zinc-950">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-zinc-950">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  const newStock = calculateNewStock()
  const stockDifference = newStock - product.stock

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Editar Inventario</h1>
                <p className="text-zinc-400 mt-1">{product.name}</p>
              </div>
            </div>

            {/* Información del Producto */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-pink-600" />
                  Información del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-400">Nombre</Label>
                    <p className="text-white font-medium mt-1">{product.name}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">SKU</Label>
                    <p className="text-white font-medium mt-1">{product.sku}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Categoría</Label>
                    <p className="text-white font-medium mt-1">{product.category}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Stock Mínimo</Label>
                    <p className="text-white font-medium mt-1">{product.minStock} unidades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Actual */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-400">Stock Actual</Label>
                    <p className="text-4xl font-bold text-white mt-2">{product.stock}</p>
                    <p className="text-sm text-zinc-500 mt-1">unidades disponibles</p>
                  </div>
                  <Package className="h-16 w-16 text-pink-600" />
                </div>
              </CardContent>
            </Card>

            {/* Formulario de Ajuste */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Ajustar Stock</CardTitle>
                <CardDescription className="text-zinc-400">
                  Modifica la cantidad de unidades disponibles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo de Ajuste */}
                <div>
                  <Label htmlFor="adjustmentType" className="text-zinc-300">
                    Tipo de ajuste
                  </Label>
                  <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="add" className="text-white">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          Sumar unidades (Entrada de inventario)
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract" className="text-white">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 rotate-180 text-red-400" />
                          Restar unidades (Salida de inventario)
                        </div>
                      </SelectItem>
                      <SelectItem value="set" className="text-white">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          Establecer cantidad exacta
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cantidad */}
                <div>
                  <Label htmlFor="amount" className="text-zinc-300">
                    Cantidad
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    placeholder={
                      adjustmentType === "set" 
                        ? "Ingresa el stock total deseado" 
                        : "Ingresa la cantidad a ajustar"
                    }
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white mt-2"
                  />
                </div>

                {/* Preview del cambio */}
                {adjustmentAmount && (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">Stock actual</p>
                        <p className="text-2xl font-bold text-white">{product.stock}</p>
                      </div>
                      <div className="text-2xl font-bold text-zinc-600">→</div>
                      <div>
                        <p className="text-sm text-zinc-400">Nuevo stock</p>
                        <p className={`text-2xl font-bold ${
                          stockDifference > 0 ? "text-green-400" : 
                          stockDifference < 0 ? "text-red-400" : "text-white"
                        }`}>
                          {newStock}
                          {stockDifference !== 0 && (
                            <span className="text-sm ml-2">
                              ({stockDifference > 0 ? "+" : ""}{stockDifference})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nota */}
                <div>
                  <Label htmlFor="note" className="text-zinc-300">
                    Motivo del ajuste (opcional)
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Ej: Reposición de proveedor, Venta directa, Ajuste por inventario físico..."
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white mt-2"
                    rows={3}
                  />
                </div>

                <Separator className="bg-zinc-800" />

                {/* Botones */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAdjustStock}
                    disabled={saving || !adjustmentAmount}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Confirmar Ajuste
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Botón para ver historial */}
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/inventory/${product.id}/history`)}
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Ver Historial de Movimientos
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
