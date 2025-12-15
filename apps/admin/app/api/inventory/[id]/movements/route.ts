// app/api/inventory/[id]/movements/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

type MovementModel = Awaited<
  ReturnType<typeof prisma.stockMovement.findMany>
>[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        { status: 404 },
      );
    }

    const url = new URL(request.url);
    const typeParam = url.searchParams.get("type"); // PURCHASE | SALE | ADJUSTMENT | null

    const movements = await prisma.stockMovement.findMany({
      where: {
        productId: id,
        // si viene un type, lo usamos en bruto; si no, no filtramos
        ...(typeParam ? { type: typeParam as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          currentStock: product.stock,
        },
        movements: movements.map((m: MovementModel) => ({
          id: m.id,
          type: m.type,
          quantity: m.quantity,
          previousStock: m.previousStock,
          newStock: m.newStock,
          unitCost: m.unit_cost,
          unitPrice: m.unit_price,
          totalValue: m.total_value,
          referenceType: m.reference_type,
          referenceId: m.reference_id,
          reason: m.reason,
          notes: m.notes,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("Error al obtener movimientos:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener movimientos" },
      { status: 500 },
    );
  }
}
