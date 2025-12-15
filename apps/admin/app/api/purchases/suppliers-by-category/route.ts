import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");

    if (!categorySlug) {
      return NextResponse.json(
        { success: false, error: "categorySlug es requerido" },
        { status: 400 }
      );
    }

    // Query SQL optimizado basado en tus datos reales
    const suppliers = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      email: string;
      product_count: bigint;
    }>>`
      SELECT DISTINCT
        s.id,
        s.name,
        s.email,
        COUNT(DISTINCT p.id) as product_count
      FROM suppliers s
      INNER JOIN product_suppliers ps ON ps.supplier_id = s.id
      INNER JOIN products p ON ps.product_id = p.id
      INNER JOIN categories c ON p.category_id = c.id
      WHERE c.slug = ${categorySlug}
        AND s.is_active = true
        AND p.is_published = true
      GROUP BY s.id, s.name, s.email
      ORDER BY s.name
    `;

    // Convertir bigint a number
    const formattedSuppliers = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      productCount: Number(s.product_count),
    }));

    console.log(`✅ ${formattedSuppliers.length} proveedores para ${categorySlug}`);

    return NextResponse.json({
      success: true,
      data: formattedSuppliers,
      meta: {
        categorySlug,
        total: formattedSuppliers.length,
      },
    });
  } catch (error) {
    console.error("Error fetching suppliers by category:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener proveedores" },
      { status: 500 }
    );
  }
}
