import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET - Listar proveedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const suppliers = await prisma.suppliers.findMany({
      where: isActive !== null ? { is_active: isActive === "true" } : {},
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        tax_id: true,
        is_active: true,
        created_at: true,
        _count: {
          select: { purchase_orders: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        address: s.address,
        taxId: s.tax_id,
        isActive: s.is_active,
        createdAt: s.created_at?.toISOString(),
        totalOrders: s._count.purchase_orders,
      })),
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener proveedores" },
      { status: 500 }
    );
  }
}

// POST - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, taxId } = body;

    // Validaciones
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un proveedor con ese nombre
    const existing = await prisma.suppliers.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe un proveedor con ese nombre" },
        { status: 400 }
      );
    }

    const supplier = await prisma.suppliers.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        tax_id: taxId?.trim() || null,
        is_active: true,
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
        createdAt: supplier.created_at?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear proveedor" },
      { status: 500 }
    );
  }
}
