"use client"

import { useEffect, useState } from "react"
import { Card } from "@jess/ui/card"
import Image from "next/image"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)

interface Transaction {
  id: string
  name: string
  amount: number
  orderNumber: string
  date: string
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
        setTransactions(Array.isArray(json) ? json : [])
      } catch {
        setTransactions([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <Card className="bg-card border border-border p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Latest Transactions
      </h3>
      <div className="flex-1 overflow-auto space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : transactions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No hay transacciones recientes
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                  {transaction.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground">
                  {transaction.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
