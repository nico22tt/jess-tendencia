import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener producto
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        name: true,
        sku: true,
        stock: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Obtener movimientos de stock
    const movements = await prisma.stockMovement.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 50 // Últimos 50 movimientos
    })

    return NextResponse.json({
      success: true,
      data: {
        product: {
          name: product.name,
          sku: product.sku,
          currentStock: product.stock
        },
        movements: movements.map(m => ({
          id: m.id,
          type: m.type,
          amount: m.amount,
          previousStock: m.previousStock,
          newStock: m.newStock,
          reason: m.reason,
          user: "Admin", // TODO: obtener nombre real del usuario
          date: m.createdAt.toISOString().split("T")[0],
          time: m.createdAt.toTimeString().split(" ")[0].substring(0, 5)
        }))
      }
    })
  } catch (error) {
    console.error("Error al obtener historial:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener historial" },
      { status: 500 }
    )
  }
}
