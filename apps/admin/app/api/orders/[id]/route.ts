import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"
import { createNotification } from "@jess/shared/lib/notifications"
import {
  registerOrderInCashFlow,
  removeOrderFromCashFlow,
  registerRefundInCashFlow,
} from "@/lib/cash-flow-helpers"

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
        order_items: {  // ✅ snake_case
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

    console.log("🔧 Actualizando orden:", id, "a estado:", status)

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Estado requerido" },
        { status: 400 }
      )
    }

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

    console.log("📦 Orden actual:", {
      order_number: currentOrder.order_number,  // ✅ snake_case
      status: currentOrder.status,
      payment_status: currentOrder.payment_status,  // ✅ snake_case
      paid_at: currentOrder.paid_at,  // ✅ snake_case
    })

    // ✅ Actualizar orden (usando snake_case)
    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        // Si se marca como PAID y no tenía paid_at, actualizar payment_status y paid_at
        ...(status === "PAID" && !currentOrder.paid_at
          ? {
              payment_status: "PAID",  // ✅ snake_case
              paid_at: new Date(),      // ✅ snake_case
            }
          : {}),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: {  // ✅ snake_case
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

    console.log("✅ Orden actualizada exitosamente")

    // ✅ LÓGICA DE CASH FLOW
    if (currentOrder.status !== status) {
      // Caso 1: Orden marcada como PAID → Registrar ingreso
      if (status === "PAID" && currentOrder.payment_status !== "PAID") {
        try {
          await registerOrderInCashFlow(id)
          console.log(`✓ Order ${currentOrder.order_number} registered in cash flow`)
        } catch (error) {
          console.error("Error registering in cash flow:", error)
        }
      }

      // Caso 2: Orden marcada como REFUNDED → Registrar reembolso
      if (status === "REFUNDED") {
        try {
          await removeOrderFromCashFlow(id)
          await registerRefundInCashFlow(id)
          console.log(`✓ Refund registered for order ${currentOrder.order_number}`)
        } catch (error) {
          console.error("Error registering refund:", error)
        }
      }

      // Caso 3: Orden cancelada después de estar PAID → Eliminar ingreso
      if (status === "CANCELLED" && currentOrder.payment_status === "PAID") {
        try {
          await removeOrderFromCashFlow(id)
          console.log(`✓ Order ${currentOrder.order_number} removed from cash flow`)
        } catch (error) {
          console.error("Error removing from cash flow:", error)
        }
      }

      // Notificación
      try {
        await createNotification({
          type: "order_status",
          title: "Estado de orden actualizado",
          message: `La orden #${currentOrder.order_number} cambió de "${currentOrder.status}" a "${status}"`,
          orderId: id,
        })
      } catch (error) {
        console.error("Error creating notification:", error)
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error: any) {
    console.error("❌ Error al actualizar orden:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar orden" },
      { status: 500 }
    )
  }
}
