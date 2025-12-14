import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Cambio aquí
) {
  try {
    const { id } = await context.params; // ✅ Await aquí
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

    // ✅ Procesar en transacción
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const { itemId, quantityReceived } = item;

        if (!quantityReceived || quantityReceived <= 0) {
          continue;
        }

        // Obtener item de la orden
        const orderItem = purchaseOrder.purchase_order_items.find(
          (oi) => oi.id === itemId
        );

        if (!orderItem) {
          throw new Error(`Item ${itemId} no encontrado en la orden`);
        }

        const newQuantityReceived =
          Number(orderItem.quantity_received) + Number(quantityReceived);

        if (newQuantityReceived > Number(orderItem.quantity_ordered)) {
          throw new Error(
            `No se puede recibir más de lo ordenado para ${orderItem.product_id}`
          );
        }

        // ✅ 1. Actualizar item de la orden
        await tx.purchase_order_items.update({
          where: { id: itemId },
          data: {
            quantity_received: newQuantityReceived,
          },
        });

        // ✅ 2. Obtener producto actual
        const product = await tx.product.findUnique({
          where: { id: orderItem.product_id },
        });

        if (!product) {
          throw new Error(`Producto ${orderItem.product_id} no encontrado`);
        }

        const currentStock = Number(product.stock) || 0;
        const newStock = currentStock + Number(quantityReceived);
        const unitCost = Number(orderItem.unit_price);

        // ✅ 3. Calcular nuevo costo promedio
        const currentAverageCost = Number(product.average_cost) || 0;
        const currentStockValue = currentStock * currentAverageCost;
        const newStockValue = Number(quantityReceived) * unitCost;
        const totalStockValue = currentStockValue + newStockValue;
        const newAverageCost = newStock > 0 ? totalStockValue / newStock : unitCost;

        console.log("📊 Cálculo de costos:", {
          producto: product.name,
          stockAnterior: currentStock,
          stockNuevo: newStock,
          costoPromedioAnterior: currentAverageCost,
          costoPromedioNuevo: newAverageCost,
          ultimoCosto: unitCost,
        });

        // ✅ 4. Actualizar producto con nuevos costos
        await tx.product.update({
          where: { id: orderItem.product_id },
          data: {
            stock: newStock,
            average_cost: new Decimal(newAverageCost.toFixed(2)),
            last_cost: new Decimal(unitCost.toFixed(2)),
          },
        });

        // ✅ 5. Crear movimiento de stock (INGRESO)
        await tx.stockMovement.create({
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
        });
      }

      // ✅ 6. Verificar si todos los items fueron recibidos completamente
      const allItemsReceived = purchaseOrder.purchase_order_items.every(
        (oi) => {
          const received = items.find((i: any) => i.itemId === oi.id);
          const totalReceived =
            Number(oi.quantity_received) + (received?.quantityReceived || 0);
          return totalReceived >= Number(oi.quantity_ordered);
        }
      );

      // ✅ 7. Actualizar estado de la orden
      await tx.purchase_orders.update({
        where: { id },
        data: {
          status: allItemsReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
        },
      });
    });

    // ✅ Obtener orden actualizada
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
