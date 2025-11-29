// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Falta el id de la orden." },
      { status: 400 }
    )
  }

  try {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            products: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Error consultando orden" },
      { status: 500 }
    )
  }
}
