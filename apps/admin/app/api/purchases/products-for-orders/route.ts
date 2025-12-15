import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");     // opcional
    const categorySlug = searchParams.get("categorySlug"); // opcional
    const supplierId = searchParams.get("supplierId");     // opcional, pero recomendado

    if (!categoryId && !categorySlug) {
      return NextResponse.json(
        { success: false, error: "categoryId o categorySlug es requerido" },
        { status: 400 }
      );
    }

    // Construir filtro
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Resolver categoryId desde slug si hace falta
    if (!categoryId && categorySlug) {
      const category = await prisma.category.findFirst({
        where: { slug: categorySlug },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Categoría no encontrada" },
          { status: 404 }
        );
      }

      where.categoryId = category.id;
    }

    // OJO: aquí NO filtramos por supplier en el where,
    // así devolvemos TODOS los productos de la categoría.

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        // Solo buscamos info de proveedor si viene supplierId
        product_suppliers: supplierId
          ? {
              where: { supplier_id: supplierId },
              include: {
                suppliers: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            }
          : false,
      },
    });

    const formatted = products.map((p) => {
      // @ts-ignore product_suppliers puede ser array o false
      const supplierInfo =
        supplierId &&
        Array.isArray(p.product_suppliers) &&
        p.product_suppliers.length > 0
          ? p.product_suppliers[0]
          : null;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock ?? 0, // ✅ mostrar también los nuevos sin stock
        categoryId: p.categoryId,
        category: p.category,
        basePrice: p.basePrice,
        lastCost: p.last_cost ?? null,
        // Info del proveedor específica (si existe relación)
        ...(supplierInfo && {
          supplierCost: supplierInfo.unit_cost,
          supplierSku: supplierInfo.supplier_sku || p.sku,
          leadTimeDays: supplierInfo.lead_time_days,
          minimumOrderQty: supplierInfo.minimum_order_qty,
          isPreferredSupplier: supplierInfo.is_preferred,
        }),
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: {
        total: formatted.length,
        categoryId: formatted[0]?.categoryId ?? where.categoryId,
        supplierId,
      },
    });
  } catch (error) {
    console.error("Error fetching products for orders:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener productos para órdenes" },
      { status: 500 }
    );
  }
}
