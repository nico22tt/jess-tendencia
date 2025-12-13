import prisma from "@jess/shared/lib/prisma"

export async function registerOrderInCashFlow(orderId: string) {
  try {
    // Obtener la orden
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        order_number: true,
        total: true,
        payment_method: true,
        paid_at: true,
        shipping_name: true,
        status: true,
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Verificar si ya existe en cash flow
    const existing = await prisma.cash_flow.findFirst({
      where: {
        reference_type: "ORDER",
        reference_id: orderId,
      },
    })

    if (existing) {
      console.log(`✓ Order ${order.order_number} already registered in cash flow`)
      return existing
    }

    // Crear entrada en cash flow
    const cashFlowEntry = await prisma.cash_flow.create({
      data: {
        type: "INCOME",
        category: "SALES",
        amount: order.total,
        description: `Venta orden ${order.order_number} - Cliente: ${order.shipping_name}`,
        payment_method: order.payment_method || "WEBPAY",
        reference_type: "ORDER",
        reference_id: order.id,
        date: order.paid_at || new Date(),
      },
    })

    console.log(`✓ Order ${order.order_number} registered in cash flow: $${order.total}`)
    return cashFlowEntry
  } catch (error) {
    console.error("Error registering order in cash flow:", error)
    throw error
  }
}

export async function removeOrderFromCashFlow(orderId: string) {
  try {
    // Buscar entrada existente
    const existing = await prisma.cash_flow.findFirst({
      where: {
        reference_type: "ORDER",
        reference_id: orderId,
      },
    })

    if (!existing) {
      console.log(`No cash flow entry found for order ${orderId}`)
      return null
    }

    // Eliminar entrada
    const deleted = await prisma.cash_flow.delete({
      where: { id: existing.id },
    })

    console.log(`✓ Removed order ${orderId} from cash flow`)
    return deleted
  } catch (error) {
    console.error("Error removing order from cash flow:", error)
    throw error
  }
}

export async function registerRefundInCashFlow(orderId: string, amount?: number) {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        order_number: true,
        total: true,
        shipping_name: true,
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    const refundAmount = amount || order.total

    // Crear gasto por reembolso
    const cashFlowEntry = await prisma.cash_flow.create({
      data: {
        type: "EXPENSE",
        category: "REFUNDS",
        amount: refundAmount,
        description: `Reembolso orden ${order.order_number} - Cliente: ${order.shipping_name}`,
        payment_method: "REFUND",
        reference_type: "ORDER",
        reference_id: orderId,
        date: new Date(),
      },
    })

    console.log(`✓ Refund registered for order ${order.order_number}: $${refundAmount}`)
    return cashFlowEntry
  } catch (error) {
    console.error("Error registering refund in cash flow:", error)
    throw error
  }
}

// ✅ NUEVO: Registrar mermas/ajustes negativos de inventario
export async function registerShrinkageInCashFlow(data: {
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitCost: number
  reason: string
  adjustmentId?: string
}) {
  try {
    const totalLoss = data.quantity * data.unitCost

    // Verificar si ya existe (por si hay duplicados)
    if (data.adjustmentId) {
      const existing = await prisma.cash_flow.findFirst({
        where: {
          reference_type: "INVENTORY_ADJUSTMENT",
          reference_id: data.adjustmentId,
        },
      })

      if (existing) {
        console.log(`✓ Shrinkage already registered for adjustment ${data.adjustmentId}`)
        return existing
      }
    }

    // Crear gasto por merma
    const cashFlowEntry = await prisma.cash_flow.create({
      data: {
        type: "EXPENSE",
        category: "SHRINKAGE",
        amount: totalLoss,
        description: `Merma: ${data.productName} (${data.productSku}) - ${data.quantity} unidades. Razón: ${data.reason}`,
        payment_method: "SHRINKAGE",
        reference_type: data.adjustmentId ? "INVENTORY_ADJUSTMENT" : "PRODUCT",
        reference_id: data.adjustmentId || data.productId,
        date: new Date(),
      },
    })

    console.log(
      `✓ Shrinkage registered: ${data.productName} - ${data.quantity} units - $${totalLoss}`
    )
    return cashFlowEntry
  } catch (error) {
    console.error("Error registering shrinkage in cash flow:", error)
    throw error
  }
}

// ✅ CORREGIDO: Registrar compras a proveedores
export async function registerPurchaseInCashFlow(purchaseOrderId: string) {
  try {
    // Obtener la orden de compra con los campos correctos
    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { id: purchaseOrderId },
      select: {
        id: true,
        order_number: true,
        total: true, // ✅ Cambió de total_amount a total
        payment_method: true,
        paid_at: true,
        payment_status: true,
        supplier_id: true, // ✅ Obtener supplier_id
      },
    })

    if (!purchaseOrder) {
      throw new Error("Purchase order not found")
    }

    // Solo registrar si está pagada
    if (purchaseOrder.payment_status !== "PAID") {
      console.log(
        `Purchase order ${purchaseOrder.order_number} not paid yet, skipping cash flow`
      )
      return null
    }

    // Obtener nombre del proveedor por separado
    const supplier = await prisma.suppliers.findUnique({
      where: { id: purchaseOrder.supplier_id },
      select: { name: true },
    })

    // Verificar si ya existe
    const existing = await prisma.cash_flow.findFirst({
      where: {
        reference_type: "PURCHASE_ORDER",
        reference_id: purchaseOrderId,
      },
    })

    if (existing) {
      console.log(
        `✓ Purchase order ${purchaseOrder.order_number} already registered in cash flow`
      )
      return existing
    }

    // Convertir Decimal a number
    const totalAmount = Number(purchaseOrder.total)

    // Crear gasto por compra
    const cashFlowEntry = await prisma.cash_flow.create({
      data: {
        type: "EXPENSE",
        category: "PURCHASES",
        amount: totalAmount,
        description: `Compra a proveedor ${supplier?.name || "Desconocido"} - OC ${purchaseOrder.order_number}`,
        payment_method: purchaseOrder.payment_method || "TRANSFER",
        reference_type: "PURCHASE_ORDER",
        reference_id: purchaseOrder.id,
        date: purchaseOrder.paid_at || new Date(),
      },
    })

    console.log(
      `✓ Purchase order ${purchaseOrder.order_number} registered in cash flow: $${totalAmount}`
    )
    return cashFlowEntry
  } catch (error) {
    console.error("Error registering purchase in cash flow:", error)
    throw error
  }
}

// ✅ NUEVO: Registrar gastos operacionales generales
export async function registerExpenseInCashFlow(data: {
  category: "SALARIES" | "SERVICES" | "TAXES" | "RENT" | "UTILITIES" | "OTHER"
  amount: number
  description: string
  paymentMethod?: string
  referenceType?: string
  referenceId?: string
}) {
  try {
    const cashFlowEntry = await prisma.cash_flow.create({
      data: {
        type: "EXPENSE",
        category: data.category,
        amount: data.amount,
        description: data.description,
        payment_method: data.paymentMethod || "CASH",
        reference_type: data.referenceType || null,
        reference_id: data.referenceId || null,
        date: new Date(),
      },
    })

    console.log(`✓ Expense registered: ${data.category} - $${data.amount}`)
    return cashFlowEntry
  } catch (error) {
    console.error("Error registering expense in cash flow:", error)
    throw error
  }
}
