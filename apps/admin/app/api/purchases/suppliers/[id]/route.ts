import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET - Detalle de proveedor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supplier = await prisma.suppliers.findUnique({
      where: { id },
      include: {
        purchase_orders: {
          orderBy: { order_date: "desc" },
          take: 10,
          select: {
            id: true,
            order_number: true,
            status: true,
            total: true,
            order_date: true,
          },
        },
        _count: {
          select: { purchase_orders: true },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        taxId: supplier.tax_id,
        isActive: supplier.is_active,
        createdAt: supplier.created_at?.toISOString(),
        updatedAt: supplier.updated_at?.toISOString(),
        totalOrders: supplier._count.purchase_orders,
        recentOrders: supplier.purchase_orders.map((po) => ({
          id: po.id,
          orderNumber: po.order_number,
          status: po.status,
          total: po.total.toString(),
          orderDate: po.order_date.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener proveedor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, address, taxId, isActive } = body;

    // Verificar que existe
    const existing = await prisma.suppliers.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    // Validar nombre
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar duplicados (excluyendo el actual)
    const duplicate = await prisma.suppliers.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Ya existe otro proveedor con ese nombre" },
        { status: 400 }
      );
    }

    const supplier = await prisma.suppliers.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        tax_id: taxId?.trim() || null,
        is_active: isActive ?? existing.is_active,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        taxId: supplier.tax_id,
        isActive: supplier.is_active,
        updatedAt: supplier.updated_at?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar proveedor" },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar proveedor (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supplier = await prisma.suppliers.findUnique({ where: { id } });
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene órdenes pendientes
    const pendingOrders = await prisma.purchase_orders.count({
      where: {
        supplier_id: id,
        status: { in: ["PENDING", "PARTIALLY_RECEIVED"] },
      },
    });

    if (pendingOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede desactivar. El proveedor tiene ${pendingOrders} orden(es) pendiente(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.suppliers.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Proveedor desactivado correctamente",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { success: false, error: "Error al desactivar proveedor" },
      { status: 500 }
    );
  }
}
