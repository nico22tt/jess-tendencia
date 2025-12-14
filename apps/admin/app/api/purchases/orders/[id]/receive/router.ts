import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// POST - Recibir mercadería (parcial o total)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { items, notes } = body;
    // items: [{ itemId, quantityReceived }]

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debe especificar los productos recibidos" },
        { status: 400 }
      );
    }

    // Verificar que la orden existe
    const order = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        purchase_order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden de compra no encontrada" },
        { status: 404 }
      );
    }

    // Validar estado de la orden
    if (order.status === "RECEIVED") {
      return NextResponse.json(
        { success: false, error: "Esta orden ya fue recibida completamente" },
        { status: 400 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "No se puede recibir mercadería de una orden cancelada" },
        { status: 400 }
      );
    }

    // Validar items recibidos
    for (const item of items) {
      if (!item.itemId || item.quantityReceived === undefined || item.quantityReceived <= 0) {
        return NextResponse.json(
          { success: false, error: "Cada item debe tener ID y cantidad recibida mayor a 0" },
          { status: 400 }
        );
      }

      const orderItem = order.purchase_order_items.find((oi) => oi.id === item.itemId);
      if (!orderItem) {
        return NextResponse.json(
          { success: false, error: `Item ${item.itemId} no encontrado en esta orden` },
          { status: 400 }
        );
      }

      const pendingQty = orderItem.quantity_ordered - orderItem.quantity_received;
      if (item.quantityReceived > pendingQty) {
        return NextResponse.json(
          {
            success: false,
            error: `No puede recibir ${item.quantityReceived} unidades de "${orderItem.products.name}". Pendiente: ${pendingQty}`,
          },
          { status: 400 }
        );
      }
    }

    // Procesar recepción en transacción
    const result = await prisma.$transaction(async (tx) => {
      const movements = [];

      // Actualizar cada item recibido
      for (const item of items) {
        const orderItem = order.purchase_order_items.find((oi) => oi.id === item.itemId);
        if (!orderItem) continue;

        const newQuantityReceived = orderItem.quantity_received + item.quantityReceived;

        // 1. Actualizar purchase_order_item
        await tx.purchase_order_items.update({
          where: { id: item.itemId },
          data: { quantity_received: newQuantityReceived },
        });

        // 2. Actualizar stock del producto
        const product = await tx.product.findUnique({
          where: { id: orderItem.product_id },
        });

        if (!product) continue;

        const previousStock = product.stock || 0;
        const newStock = previousStock + item.quantityReceived;

        // Calcular nuevo costo promedio ponderado
        const currentCost = product.average_cost ? parseFloat(product.average_cost.toString()) : 0;
        const currentValue = currentCost * previousStock;
        const newValue = parseFloat(orderItem.unit_price.toString()) * item.quantityReceived;
        const newAverageCost = newStock > 0 
          ? (currentValue + newValue) / newStock 
          : parseFloat(orderItem.unit_price.toString());

        await tx.product.update({
          where: { id: orderItem.product_id },
          data: {
            stock: newStock,
            average_cost: new Decimal(newAverageCost.toFixed(2)),
            last_cost: orderItem.unit_price,
            updatedAt: new Date(),
          },
        });

        // 3. Crear movimiento de inventario
        const movement = await tx.stockMovement.create({
          data: {
            productId: orderItem.product_id,
            type: "PURCHASE",
            quantity: item.quantityReceived,
            previousStock: previousStock,
            newStock: newStock,
            unit_cost: orderItem.unit_price,
            total_value: new Decimal(
              (parseFloat(orderItem.unit_price.toString()) * item.quantityReceived).toFixed(2)
            ),
            reference_type: "purchase_order",
            reference_id: order.id,
            notes: notes || `Recepción de orden ${order.order_number}`,
          },
        });

        movements.push(movement);
      }

      // 4. Determinar nuevo estado de la orden
      const allItems = await tx.purchase_order_items.findMany({
        where: { purchase_order_id: id },
      });

      const allReceived = allItems.every((i) => i.quantity_received >= i.quantity_ordered);
      const someReceived = allItems.some((i) => i.quantity_received > 0);

      let newStatus: string;
      if (allReceived) {
        newStatus = "RECEIVED";
      } else if (someReceived) {
        newStatus = "PARTIALLY_RECEIVED";
      } else {
        newStatus = "PENDING";
      }

      // 5. Actualizar estado de la orden
      await tx.purchase_orders.update({
        where: { id },
        data: {
          status: newStatus as any,
          updated_at: new Date(),
        },
      });

      return { newStatus, movements };
    });

    // Obtener orden actualizada
    const updatedOrder = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        purchase_order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                sku: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mercadería recibida correctamente",
      data: {
        orderId: id,
        orderNumber: order.order_number,
        newStatus: result.newStatus,
        itemsReceived: items.length,
        movementsCreated: result.movements.length,
        items: updatedOrder!.purchase_order_items.map((item) => ({
          id: item.id,
          product: {
            id: item.products.id,
            name: item.products.name,
            sku: item.products.sku,
            currentStock: item.products.stock,
          },
          quantityOrdered: item.quantity_ordered,
          quantityReceived: item.quantity_received,
          pending: item.quantity_ordered - item.quantity_received,
        })),
      },
    });
  } catch (error) {
    console.error("Error receiving purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Error al recibir mercadería" },
      { status: 500 }
    );
  }
}
