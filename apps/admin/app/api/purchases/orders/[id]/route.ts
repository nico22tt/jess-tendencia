import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET - Detalle de orden de compra
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        suppliers: true,
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

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden de compra no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        orderDate: order.order_date.toISOString(),
        expectedDate: order.expected_date?.toISOString(),
        supplier: {
          id: order.suppliers.id,
          name: order.suppliers.name,
          email: order.suppliers.email,
          phone: order.suppliers.phone,
          address: order.suppliers.address,
          taxId: order.suppliers.tax_id,
        },
        subtotal: order.subtotal.toString(),
        tax: order.tax.toString(),
        total: order.total.toString(),
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        paidAt: order.paid_at?.toISOString(),
        notes: order.notes,
        items: order.purchase_order_items.map((item) => ({
          id: item.id,
          product: {
            id: item.products.id,
            name: item.products.name,
            sku: item.products.sku,
            currentStock: item.products.stock,
          },
          quantityOrdered: item.quantity_ordered,
          quantityReceived: item.quantity_received,
          unitPrice: item.unit_price.toString(),
          totalPrice: (item.quantity_ordered * parseFloat(item.unit_price.toString())).toFixed(2),
        })),
        createdAt: order.created_at?.toISOString(),
        updatedAt: order.updated_at?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener orden de compra" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar orden de compra (solo si está PENDING y no ha recibido mercadería)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { expectedDate, items, notes } = body;
    // items: [{ itemId?, productId, quantity, unitPrice }]

    // Verificar que la orden existe
    const order = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        purchase_order_items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden de compra no encontrada" },
        { status: 404 }
      );
    }

    // Solo se pueden editar órdenes PENDING
    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede editar una orden en estado ${order.status}`,
        },
        { status: 400 }
      );
    }

    // Verificar que no se haya recibido mercadería
    const hasReceivedItems = order.purchase_order_items.some(
      (item) => item.quantity_received > 0
    );

    if (hasReceivedItems) {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede editar una orden que ya tiene mercadería recibida",
        },
        { status: 400 }
      );
    }

    // Validar items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debe incluir al menos un producto" },
        { status: 400 }
      );
    }

    // Calcular nuevos totales
    let subtotal = 0;
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          {
            success: false,
            error: "Cada producto debe tener ID, cantidad y precio unitario",
          },
          { status: 400 }
        );
      }
      subtotal += item.quantity * parseFloat(item.unitPrice);
    }

    const tax = subtotal * 0; // Ajustar según tu configuración
    const total = subtotal + tax;

    // Actualizar en transacción
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Eliminar items antiguos
      await tx.purchase_order_items.deleteMany({
        where: { purchase_order_id: id },
      });

      // 2. Crear nuevos items
      for (const item of items) {
        await tx.purchase_order_items.create({
          data: {
            purchase_order_id: id,
            product_id: item.productId,
            quantity_ordered: item.quantity,
            quantity_received: 0,
            unit_price: parseFloat(item.unitPrice),
          },
        });
      }

      // 3. Actualizar orden
      return await tx.purchase_orders.update({
        where: { id },
        data: {
          expected_date: expectedDate ? new Date(expectedDate) : null,
          subtotal,
          tax,
          total,
          notes: notes || order.notes,
          updated_at: new Date(),
        },
        include: {
          suppliers: true,
          purchase_order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Orden actualizada correctamente",
      data: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        expectedDate: updatedOrder.expected_date?.toISOString(),
        supplier: {
          id: updatedOrder.suppliers.id,
          name: updatedOrder.suppliers.name,
        },
        subtotal: updatedOrder.subtotal.toString(),
        tax: updatedOrder.tax.toString(),
        total: updatedOrder.total.toString(),
        items: updatedOrder.purchase_order_items.map((item) => ({
          id: item.id,
          product: {
            id: item.products.id,
            name: item.products.name,
            sku: item.products.sku,
          },
          quantityOrdered: item.quantity_ordered,
          unitPrice: item.unit_price.toString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar orden de compra" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar orden
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.purchase_orders.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden de compra no encontrada" },
        { status: 404 }
      );
    }

    // Solo se pueden cancelar órdenes PENDING
    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede cancelar una orden en estado ${order.status}`,
        },
        { status: 400 }
      );
    }

    await prisma.purchase_orders.update({
      where: { id },
      data: {
        status: "CANCELLED",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orden cancelada correctamente",
    });
  } catch (error) {
    console.error("Error cancelling purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Error al cancelar orden" },
      { status: 500 }
    );
  }
}
