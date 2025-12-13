import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        updatedAt: true,
        category: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Obtener mermas por producto (ajustes negativos)
    const losses = await prisma.stockMovement.groupBy({
      by: ["productId"],
      where: {
        type: "ADJUSTMENT",
        quantity: { lt: 0 }, // ✅ CORREGIDO: era "amount", ahora es "quantity"
      },
      _sum: { quantity: true }, // ✅ CORREGIDO: era "amount", ahora es "quantity"
    })

    const lossesMap = new Map(
      losses.map((l) => [l.productId, Math.abs(Number(l._sum.quantity) ?? 0)]) // ✅ Convertir Decimal a number
    )

    const inventoryData = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || "N/A",
      stock: product.stock ?? 0,
      category: product.category?.name || "Sin categoría",
      lastUpdated: product.updatedAt
        ? product.updatedAt.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      minStock: 10,
      losses: lossesMap.get(product.id) ?? 0, // mermas acumuladas
    }))

    return NextResponse.json({ success: true, data: inventoryData })
  } catch (error) {
    console.error("Error al obtener inventario:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener inventario" },
      { status: 500 }
    )
  }
}
