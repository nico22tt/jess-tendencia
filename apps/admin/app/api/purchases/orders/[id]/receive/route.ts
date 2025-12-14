import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { items, notes } = body;

    console.log("📦 Recibiendo mercancía:", { id, items, notes });

    // Validar datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se especificaron productos a recibir" },
        { status: 400 }
      );
    }

    // Obtener la orden de compra
    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        purchase_order_items: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: "Orden de compra no encontrada" },
        { status: 404 }
      );
    }

    // ✅ Validar los items ANTES de empezar
    for (const item of items) {
      const { itemId, quantityReceived } = item;

      if (!quantityReceived || quantityReceived <= 0) {
        continue;
      }

      const orderItem = purchaseOrder.purchase_order_items.find(
        (oi) => oi.id === itemId
      );

      if (!orderItem) {
        return NextResponse.json(
          { success: false, error: `Item ${itemId} no encontrado` },
          { status: 400 }
        );
      }

      const newQuantityReceived =
        Number(orderItem.quantity_received) + Number(quantityReceived);

      if (newQuantityReceived > Number(orderItem.quantity_ordered)) {
        return NextResponse.json(
          {
            success: false,
            error: `No se puede recibir más de lo ordenado para el item ${itemId}`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ Procesar cada item SECUENCIALMENTE (sin transacción global)
    for (const item of items) {
      const { itemId, quantityReceived } = item;

      if (!quantityReceived || quantityReceived <= 0) {
        continue;
      }

      const orderItem = purchaseOrder.purchase_order_items.find(
        (oi) => oi.id === itemId
      );

      if (!orderItem) continue;

      const newQuantityReceived =
        Number(orderItem.quantity_received) + Number(quantityReceived);
      const unitCost = Number(orderItem.unit_price);

      // Obtener producto actual
      const product = await prisma.product.findUnique({
        where: { id: orderItem.product_id },
      });

      if (!product) {
        console.error(`Producto ${orderItem.product_id} no encontrado`);
        continue;
      }

      const currentStock = Number(product.stock) || 0;
      const newStock = currentStock + Number(quantityReceived);

      // Calcular nuevo costo promedio
      const currentAverageCost = Number(product.average_cost) || 0;
      const currentStockValue = currentStock * currentAverageCost;
      const newStockValue = Number(quantityReceived) * unitCost;
      const totalStockValue = currentStockValue + newStockValue;
      const newAverageCost =
        newStock > 0 ? totalStockValue / newStock : unitCost;

      console.log("📊 Cálculo de costos:", {
        producto: product.name,
        stockAnterior: currentStock,
        stockNuevo: newStock,
        costoPromedioAnterior: currentAverageCost,
        costoPromedioNuevo: newAverageCost,
        ultimoCosto: unitCost,
      });

      // ✅ Actualizar en una transacción pequeña por item
      await prisma.$transaction([
        // 1. Actualizar cantidad recibida del item
        prisma.purchase_order_items.update({
          where: { id: itemId },
          data: {
            quantity_received: newQuantityReceived,
          },
        }),

        // 2. Actualizar stock y costos del producto
        prisma.product    .update({
          where: { id: orderItem.product_id },
          data: {
            stock: newStock,
            average_cost: new Decimal(newAverageCost.toFixed(2)),
            last_cost: new Decimal(unitCost.toFixed(2)),
          },
        }),

        // 3. Crear movimiento de stock
        prisma.stockMovement.create({
          data: {
            productId: orderItem.product_id,
            type: "PURCHASE",
            quantity: Number(quantityReceived),
            previousStock: currentStock,
            newStock: newStock,
            unit_cost: new Decimal(unitCost.toFixed(2)),
            total_value: new Decimal(
              (unitCost * Number(quantityReceived)).toFixed(2)
            ),
            reference_type: "PURCHASE_ORDER",
            reference_id: purchaseOrder.id,
            reason: `Recepción de compra - OC ${purchaseOrder.order_number}`,
            notes: notes || null,
          },
        }),
      ]);

      console.log(`✅ Item ${orderItem.product_id} procesado correctamente`);
    }

    // ✅ Verificar si todos los items fueron recibidos completamente
    const updatedOrderItems = await prisma.purchase_order_items.findMany({
      where: { purchase_order_id: id },
    });

    const allItemsReceived = updatedOrderItems.every((oi) => {
      return Number(oi.quantity_received) >= Number(oi.quantity_ordered);
    });

    // ✅ Actualizar estado de la orden
    await prisma.purchase_orders.update({
      where: { id },
      data: {
        status: allItemsReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
      },
    });

    // Obtener orden actualizada
    const updatedOrder = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        suppliers: true,
        purchase_order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    console.log("✅ Mercancía recibida correctamente");

    return NextResponse.json({
      success: true,
      message: "Mercancía recibida correctamente",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("❌ Error al recibir mercancía:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al recibir mercancía",
      },
      { status: 500 }
    );
  }
}
