"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@jess/ui/card"
import { Badge } from "@jess/ui/badge"
import { Loader2, Receipt } from "lucide-react"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

interface Transaction {
  id: string
  name: string
  amount: number
  orderNumber: string
  status: string
  date: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SUCCESS: {
    label: "Éxito",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  COMPLETED: {
    label: "Completado",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  DELIVERED: {
    label: "Entregado",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  PAID: {
    label: "Pagado",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
}

export function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/stats/transactions")
        const json = await res.json()

        if (json.success && Array.isArray(json.data)) {
          setTransactions(json.data)
        } else if (Array.isArray(json)) {
          setTransactions(json)
        } else {
          setTransactions([])
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="bg-card border border-border flex flex-col h-[500px]">
      {/* Header - altura fija */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Últimas Transacciones
          </CardTitle>
          <Receipt className="h-5 w-5 text-green-600" />
        </div>
      </CardHeader>

      {/* Content - altura calculada con scroll */}
      <CardContent className="flex-1 overflow-hidden pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-pink-600 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Receipt className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay transacciones recientes
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {transactions.map((transaction) => {
              const statusInfo = statusConfig[transaction.status] || {
                label: transaction.status,
                color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
              }

              return (
                <div
                  key={transaction.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {transaction.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        #{transaction.orderNumber}
                      </p>
                      <Badge
                        variant="outline"
                        className={`${statusInfo.color} text-xs`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(transaction.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
