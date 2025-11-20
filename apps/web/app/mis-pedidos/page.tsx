"use client"

import { ProtectedRoute } from "@jess/shared/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } 

from "@jess/ui/card"
import { Badge } 

from "@jess/ui/badge"
import { Button } 

from "@jess/ui/button"
import { Package, Eye, Truck, CheckCircle } from "lucide-react"
import Link from "next/link"

const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "entregado",
    total: 89990,
    items: [
      { name: "Zapatillas Urbanas Blancas", quantity: 1, price: 59990 },
      { name: "Jeans Skinny Azul", quantity: 1, price: 29990 },
    ],
  },
  {
    id: "ORD-002",
    date: "2024-01-20",
    status: "en_transito",
    total: 129990,
    items: [{ name: "Botas de Cuero Café", quantity: 1, price: 129990 }],
  },
  {
    id: "ORD-003",
    date: "2024-01-25",
    status: "procesando",
    total: 45990,
    items: [{ name: "Pantuflas Rosadas", quantity: 2, price: 22995 }],
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "entregado":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Entregado
        </Badge>
      )
    case "en_transito":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Truck className="h-3 w-3 mr-1" />
          En tránsito
        </Badge>
      )
    case "procesando":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Package className="h-3 w-3 mr-1" />
          Procesando
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function MisPedidosPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-4xl my-16">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
              <p className="text-gray-600">Revisa el estado de tus compras</p>
            </div>

            <div className="space-y-6">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <CardDescription>
                          Realizado el {new Date(order.date).toLocaleDateString("es-CL")}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${item.price.toLocaleString("es-CL")}</p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Link href={`/mis-pedidos/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
                          </Link>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-lg font-bold text-gray-900">${order.total.toLocaleString("es-CL")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
