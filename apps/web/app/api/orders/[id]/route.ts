import { NextRequest, NextResponse } from "next/server"
import prisma from '@jess/shared/lib/prisma'

// GET /api/orders/[id]   id = UUID de la orden
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, error: "Falta el id de la orden." }, { status: 400 })
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            products: { select: { name: true, images: true, sku: true } }
          }
        },
        user_addresses: true, // Trae la dirección completa asociada (puede ser null si es retiro)
      }
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "Orden no encontrada." }, { status: 404 })
    }

    // Puedes transformar los datos aquí si necesitas un shape más fácil para el front
    return NextResponse.json({
      success: true,
      order
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error consultando orden" }, { status: 500 })
  }
}
