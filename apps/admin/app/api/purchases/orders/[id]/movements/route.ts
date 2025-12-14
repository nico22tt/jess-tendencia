import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET - Historial de movimientos de inventario de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // PURCHASE, SALE, ADJUSTMENT
    const limit = parseInt(searchParams.get("limit") || "50");

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Obtener movimientos
    const movements = await prisma.stockMovement.findMany({
      where: {
        productId: id,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock: product.stock,
        },
        movements: movements.map((m) => ({
          id: m.id,
          type: m.type,
          quantity: m.quantity,
          previousStock: m.previousStock,
          newStock: m.newStock,
          unitCost: m.unit_cost?.toString(),
          unitPrice: m.unit_price?.toString(),
          totalValue: m.total_value?.toString(),
          referenceType: m.reference_type,
          referenceId: m.reference_id,
          reason: m.reason,
          notes: m.notes,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching product movements:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener movimientos" },
      { status: 500 }
    );
  }
}
