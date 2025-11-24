import { NextResponse } from "next/server"
import prisma from "@lib/prisma"

export async function GET() {
  try {
    // Obtén las últimas 6 órdenes exitosas
    const transactions = await prisma.orders.findMany({
      where: {
        status: { in: ["SUCCESS", "COMPLETADO", "PAID"] }
      },
      select: {
        id: true,
        order_number: true,
        shipping_name: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 6
    })

    const data = transactions.map(t => ({
      id: t.id,
      name: t.shipping_name,
      amount: t.total,
      orderNumber: t.order_number,
      date: t.createdAt
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error obteniendo transacciones:", error)
    return NextResponse.json({ error: "Error consultando transacciones" }, { status: 500 })
  }
}
