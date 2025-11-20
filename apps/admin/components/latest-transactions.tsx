"use client"

import { Card } from "@jess/ui/card"
import Image from "next/image"

const transactions = [
  { id: 1, name: "John Doe", amount: "$1.4K", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Jane Smith", amount: "$2.1K", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Mike Johnson", amount: "$890", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Sarah Williams", amount: "$3.2K", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Tom Brown", amount: "$1.8K", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 6, name: "Emily Davis", amount: "$950", avatar: "/placeholder.svg?height=40&width=40" },
]

export function LatestTransactions() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Latest Transactions</h3>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={transaction.avatar || "/placeholder.svg"}
                alt={transaction.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-sm text-zinc-300">{transaction.name}</span>
            </div>
            <span className="text-sm font-semibold text-white">{transaction.amount}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
