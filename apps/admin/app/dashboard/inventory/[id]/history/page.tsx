"use client"

import { use, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Badge } from "@jess/ui/badge"
import { ScrollArea } from "@jess/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jess/ui/table"
import { ArrowLeft, History, TrendingUp, TrendingDown, Package, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface StockMovement {
  id: string
  type: "entry" | "exit" | "adjustment"
  amount: number
  previousStock: number
  newStock: number
  reason: string
  user: string
  date: string
  time: string
}

const typeConfig = {
  entry: { label: "Entrada", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: TrendingUp },
  exit: { label: "Salida", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: TrendingDown },
  adjustment: { label: "Ajuste", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Package },
}

export default function InventoryHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    fetchHistory()
  }, [id])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/inventory/${id}/history`)
      const data = await res.json()

      if (data.success) {
        setProduct(data.data.product)
        setMovements(data.data.movements)
      } else {
        alert("Error al cargar historial")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar historial")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
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
                  <History className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Historial de Movimientos</h1>
                  <p className="text-muted-foreground mt-1">
                    {product.name} - SKU: {product.sku}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Stock Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Actual</p>
                  <p className="text-4xl font-bold text-foreground mt-2">{product.currentStock}</p>
                  <p className="text-sm text-muted-foreground mt-1">unidades disponibles</p>
                </div>
                <Package className="h-16 w-16 text-pink-600" />
              </div>
            </div>

            {/* Movements Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Movimientos Registrados</h2>
                <p className="text-sm text-muted-foreground mt-1">Historial completo de entradas y salidas</p>
              </div>
              <ScrollArea className="h-[500px]">
                {movements.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No hay movimientos registrados para este producto
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-card">
                        <TableHead className="text-muted-foreground">Fecha y Hora</TableHead>
                        <TableHead className="text-muted-foreground">Tipo</TableHead>
                        <TableHead className="text-muted-foreground">Cantidad</TableHead>
                        <TableHead className="text-muted-foreground">Stock Anterior</TableHead>
                        <TableHead className="text-muted-foreground">Stock Nuevo</TableHead>
                        <TableHead className="text-muted-foreground">Motivo</TableHead>
                        <TableHead className="text-muted-foreground">Usuario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => {
                        const config = typeConfig[movement.type]
                        const Icon = config.icon

                        return (
                          <TableRow key={movement.id} className="border-border hover:bg-muted/50">
                            <TableCell className="text-muted-foreground">
                              <div>
                                <p className="font-medium">{movement.date}</p>
                                <p className="text-sm text-muted-foreground">{movement.time}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={config.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-semibold ${
                                  movement.amount > 0 ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {movement.amount > 0 ? "+" : ""}
                                {movement.amount}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{movement.previousStock}</TableCell>
                            <TableCell className="text-foreground font-semibold">{movement.newStock}</TableCell>
                            <TableCell className="text-muted-foreground">{movement.reason}</TableCell>
                            <TableCell className="text-muted-foreground">{movement.user}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
