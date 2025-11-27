// apps/admin/app/api/inventory/route.ts
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
