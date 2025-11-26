import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"
import { createNotification } from "@jess/shared/lib/notifications"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Error al obtener orden:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener orden" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Estado requerido" },
        { status: 400 }
      )
    }

    // Validar contra el constraint del DB
    const allowed = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ]

    if (!allowed.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Estado inválido" },
        { status: 400 }
      )
    }

    const currentOrder = await prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: { name: true, email: true },
        },
      },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
              },
            },
          },
        },
      },
    })

    // Notificación si el estado cambió
    if (currentOrder.status !== status) {
      await createNotification({
        type: "order_status",
        title: "Estado de orden actualizado",
        message: `La orden #${currentOrder.order_number} cambió de "${currentOrder.status}" a "${status}"`,
        orderId: id,
      })
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error("Error al actualizar orden:", error)
    return NextResponse.json(
      { success: false, error: "Error al actualizar orden" },
      { status: 500 }
    )
  }
}
