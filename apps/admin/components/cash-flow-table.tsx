"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import { Badge } from "@jess/ui/badge"
import { Loader2, TrendingUp, TrendingDown, Package2 } from "lucide-react"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// ✅ ACTUALIZADO: Labels para categorías
const categoryLabels: Record<string, { label: string; color: string }> = {
  SALES: { label: "Ventas", color: "bg-green-50 text-green-700 border-green-200" },
  PURCHASES: { label: "Compras", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REFUNDS: { label: "Reembolsos", color: "bg-red-50 text-red-700 border-red-200" },
  SALARIES: { label: "Salarios", color: "bg-purple-50 text-purple-700 border-purple-200" },
  SERVICES: { label: "Servicios", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  TAXES: { label: "Impuestos", color: "bg-pink-50 text-pink-700 border-pink-200" },
  RENT: { label: "Arriendo", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  UTILITIES: { label: "Servicios Básicos", color: "bg-teal-50 text-teal-700 border-teal-200" },
  SHRINKAGE: { label: "Mermas", color: "bg-orange-50 text-orange-700 border-orange-200" }, // ✅ NUEVO
  OTHER: { label: "Otros", color: "bg-gray-50 text-gray-700 border-gray-200" },
}

interface CashFlowEntry {
  id: string
  type: "INCOME" | "EXPENSE"
  category: string
  amount: number
  description: string
  payment_method: string | null
  date: string
  reference_type: string | null
  reference_id: string | null
}

export function CashFlowTable() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL")

  useEffect(() => {
    fetch("/api/cash-flow")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        if (json.success) {
          setEntries(json.data)
        }
      })
      .catch((error) => {
        console.error("Error fetching cash flow entries:", error)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredEntries = entries.filter((entry) => {
    if (filter === "ALL") return true
    return entry.type === filter
  })

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-pink-600" />
          <h2 className="text-xl font-semibold text-foreground">Movimientos Recientes</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "ALL"
                ? "bg-pink-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos ({entries.length})
          </button>
          <button
            onClick={() => setFilter("INCOME")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "INCOME"
                ? "bg-green-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Ingresos ({entries.filter((e) => e.type === "INCOME").length})
          </button>
          <button
            onClick={() => setFilter("EXPENSE")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "EXPENSE"
                ? "bg-red-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Gastos ({entries.filter((e) => e.type === "EXPENSE").length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium">Tipo</th>
              <th className="pb-3 font-medium">Categoría</th>
              <th className="pb-3 font-medium">Descripción</th>
              <th className="pb-3 font-medium">Método Pago</th>
              <th className="pb-3 font-medium text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 text-sm">{formatDate(entry.date)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {entry.type === "INCOME" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <Badge
                        variant="outline"
                        className={
                          entry.type === "INCOME"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {entry.type === "INCOME" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${categoryLabels[entry.category]?.color || ""}`}
                    >
                      {categoryLabels[entry.category]?.label || entry.category}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm max-w-xs truncate">{entry.description}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {entry.payment_method || "-"}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-semibold ${
                        entry.type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {entry.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(entry.amount)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
