"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@jess/shared/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } 

from "@jess/ui/card"
import { Badge } 

from "@jess/ui/badge"
import { Button } 

from "@jess/ui/button"
import { Separator } 

from "@jess/ui/separator"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard } from "lucide-react"
import Image from "next/image"

// Mock data - in a real app, this would come from an API
const mockOrderDetails = {
  "ORD-001": {
    id: "ORD-001",
    date: "2024-01-14",
    status: "entregado",
    items: [
      {
        id: 1,
        name: "Zapatillas Urbanas Blancas",
        variant: "Talla: 38, Color: Blanco",
        quantity: 1,
        price: 59990,
        image: "/white-sneakers-for-women.png",
      },
      {
        id: 2,
        name: "Jeans Skinny Azul",
        variant: "Talla: M",
        quantity: 1,
        price: 29990,
        image: "/skinny-blue-jeans-for-women.png",
      },
    ],
    shipping: {
      address: {
        region: "Región Metropolitana",
        comuna: "Santiago Centro",
        street: "Av. Libertador Bernardo O'Higgins 1234",
        additional: "Depto 501",
      },
      method: "Envío Estándar: 3-5 días hábiles",
    },
    payment: {
      subtotal: 89980,
      shipping: 4990,
      discount: 0,
      total: 94970,
      method: "Visa **** 1234",
    },
  },
  "ORD-002": {
    id: "ORD-002",
    date: "2024-01-20",
    status: "en_transito",
    items: [
      {
        id: 1,
        name: "Botas de Cuero Café",
        variant: "Talla: 39, Color: Café",
        quantity: 1,
        price: 129990,
        image: "/brown-leather-boots-for-women.png",
      },
    ],
    shipping: {
      address: {
        region: "Región de Valparaíso",
        comuna: "Viña del Mar",
        street: "Calle Marina 567",
        additional: "Casa 12",
      },
      method: "Envío Express: 1-2 días hábiles",
    },
    payment: {
      subtotal: 129990,
      shipping: 7990,
      discount: 10000,
      total: 127980,
      method: "Mastercard **** 5678",
    },
  },
  "ORD-003": {
    id: "ORD-003",
    date: "2024-01-25",
    status: "procesando",
    items: [
      {
        id: 1,
        name: "Pantuflas Rosadas",
        variant: "Talla: 37, Color: Rosa",
        quantity: 2,
        price: 22995,
        image: "/pink-slippers-for-women.png",
      },
    ],
    shipping: {
      address: {
        region: "Región del Biobío",
        comuna: "Concepción",
        street: "Av. Arturo Prat 890",
        additional: "",
      },
      method: "Envío Estándar: 3-5 días hábiles",
    },
    payment: {
      subtotal: 45990,
      shipping: 4990,
      discount: 5000,
      total: 45980,
      method: "Visa **** 9012",
    },
  },
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "entregado":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-base px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          Entregado
        </Badge>
      )
    case "en_transito":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-base px-4 py-2">
          <Truck className="h-4 w-4 mr-2" />
          En Tránsito
        </Badge>
      )
    case "procesando":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-base px-4 py-2">
          <Package className="h-4 w-4 mr-2" />
          Procesando
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const order = mockOrderDetails[id as keyof typeof mockOrderDetails]

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-4xl">
              <p className="text-center text-gray-600">Pedido no encontrado</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Back button */}
            <Button variant="ghost" onClick={() => router.push("/mis-pedidos")} className="mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Pedidos
            </Button>

            {/* Order Header Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">Detalle del Pedido #{order.id}</CardTitle>
                    <CardDescription className="text-base">
                      Realizado el{" "}
                      {new Date(order.date).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
            </Card>

            {/* Items Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Artículos Comprados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.variant}</p>
                        <p className="text-sm text-gray-600 mt-1">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toLocaleString("es-CL")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">Subtotal de Productos</p>
                    <p className="font-semibold text-gray-900">${order.payment.subtotal.toLocaleString("es-CL")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  Información de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dirección de Envío</h4>
                    <div className="text-gray-600 space-y-1">
                      <p>{order.shipping.address.region}</p>
                      <p>{order.shipping.address.comuna}</p>
                      <p>{order.shipping.address.street}</p>
                      {order.shipping.address.additional && <p>{order.shipping.address.additional}</p>}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Método de Envío</h4>
                    <p className="text-gray-600">{order.shipping.method}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  Resumen del Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal de Productos</span>
                    <span>${order.payment.subtotal.toLocaleString("es-CL")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Costo de Envío</span>
                    <span>${order.payment.shipping.toLocaleString("es-CL")}</span>
                  </div>
                  {order.payment.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-${order.payment.discount.toLocaleString("es-CL")}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Final</span>
                    <span className="text-2xl font-bold text-pink-600">
                      ${order.payment.total.toLocaleString("es-CL")}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Método de Pago</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="h-4 w-4" />
                      <span>{order.payment.method}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
