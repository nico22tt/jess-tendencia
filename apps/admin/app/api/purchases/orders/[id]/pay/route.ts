import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"
import { registerPurchaseInCashFlow } from "@/lib/cash-flow-helpers" // ✅ NUEVO

// POST - Registrar pago de orden de compra
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { paymentMethod, notes } = body

    // Validaciones
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Debe especificar el método de pago" },
        { status: 400 }
      )
    }

    const validMethods = ["CASH", "TRANSFER", "CHECK", "CREDIT_CARD", "DEBIT_CARD", "OTHER"]
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Método de pago inválido. Opciones: ${validMethods.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Verificar que la orden existe
    const order = await prisma.purchase_orders.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden de compra no encontrada" },
        { status: 404 }
      )
    }

    // Validar estado de la orden
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "No se puede pagar una orden cancelada" },
        { status: 400 }
      )
    }

    if (order.payment_status === "PAID") {
      return NextResponse.json(
        { success: false, error: "Esta orden ya fue pagada" },
        { status: 400 }
      )
    }

    // Actualizar pago
    const updatedOrder = await prisma.purchase_orders.update({
      where: { id },
      data: {
        payment_status: "PAID",
        payment_method: paymentMethod,
        paid_at: new Date(),
        notes: notes ? `${order.notes || ""}\n[PAGO] ${notes}`.trim() : order.notes,
        updated_at: new Date(),
      },
      include: {
        suppliers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // ✅ NUEVO: Registrar compra en cash flow
    try {
      await registerPurchaseInCashFlow(id)
      console.log(`✓ Compra registrada en cash flow: OC ${updatedOrder.order_number}`)
    } catch (cashFlowError) {
      console.error("Error registrando compra en cash flow:", cashFlowError)
      // No fallar la request si falla el registro en cash flow
      // El pago ya se procesó exitosamente
    }

    return NextResponse.json({
      success: true,
      message: "Pago registrado correctamente",
      data: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        supplier: {
          id: updatedOrder.suppliers.id,
          name: updatedOrder.suppliers.name,
        },
        total: updatedOrder.total.toString(),
        paymentStatus: updatedOrder.payment_status,
        paymentMethod: updatedOrder.payment_method,
        paidAt: updatedOrder.paid_at?.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { success: false, error: "Error al registrar pago" },
      { status: 500 }
    )
  }
}
