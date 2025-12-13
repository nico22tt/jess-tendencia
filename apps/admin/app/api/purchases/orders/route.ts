import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET - Listar órdenes de compra
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");

    // Validar que el status sea válido
    const validStatuses = ["PENDING", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];
    const status = statusParam && validStatuses.includes(statusParam) 
      ? statusParam 
      : null;

    const orders = await prisma.purchase_orders.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(supplierId ? { supplier_id: supplierId } : {}),
      },
      orderBy: { order_date: "desc" },
      include: {
        suppliers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: { purchase_order_items: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: orders.map((order) => ({
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
        },
        subtotal: order.subtotal.toString(),
        tax: order.tax.toString(),
        total: order.total.toString(),
        itemsCount: order._count.purchase_order_items,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        paidAt: order.paid_at?.toISOString(),
        notes: order.notes,
        createdAt: order.created_at?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener órdenes de compra" },
      { status: 500 }
    );
  }
}
// POST - Crear orden de compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplierId,
      expectedDate,
      items, // [{ productId, quantity, unitPrice }]
      notes,
    } = body;

    // Validaciones
    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: "Debe seleccionar un proveedor" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debe agregar al menos un producto" },
        { status: 400 }
      );
    }

    // Verificar que el proveedor existe y está activo
    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    if (!supplier.is_active) {
      return NextResponse.json(
        { success: false, error: "El proveedor está inactivo" },
        { status: 400 }
      );
    }

    // Generar número de orden único
    const lastOrder = await prisma.purchase_orders.findFirst({
      orderBy: { created_at: "desc" },
      select: { order_number: true },
    });

    const nextNumber = lastOrder
      ? parseInt(lastOrder.order_number.split("-")[1]) + 1
      : 1;
    const orderNumber = `PO-${nextNumber.toString().padStart(6, "0")}`;

    // Calcular totales
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

    const tax = subtotal * 0; // ajustar según tu país (ej: 0.19 para IVA 19%)
    const total = subtotal + tax;

    // Crear orden con items en una transacción
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      // Crear orden
      const order = await tx.purchase_orders.create({
        data: {
          order_number: orderNumber,
          supplier_id: supplierId,
          status: "PENDING",
          order_date: new Date(),
          expected_date: expectedDate ? new Date(expectedDate) : null,
          subtotal,
          tax,
          total,
          notes: notes || null,
          payment_status: "PENDING",
        },
      });

      // Crear items
      for (const item of items) {
        await tx.purchase_order_items.create({
          data: {
            purchase_order_id: order.id,
            product_id: item.productId,
            quantity_ordered: item.quantity,
            quantity_received: 0,
            unit_price: parseFloat(item.unitPrice),
          },
        });
      }

      return order;
    });

    // Obtener orden completa con relaciones
    const fullOrder = await prisma.purchase_orders.findUnique({
      where: { id: purchaseOrder.id },
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

    return NextResponse.json({
      success: true,
      data: {
        id: fullOrder!.id,
        orderNumber: fullOrder!.order_number,
        status: fullOrder!.status,
        supplier: {
          id: fullOrder!.suppliers.id,
          name: fullOrder!.suppliers.name,
        },
        total: fullOrder!.total.toString(),
        items: fullOrder!.purchase_order_items.map((item) => ({
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
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear orden de compra" },
      { status: 500 }
    );
  }
}
