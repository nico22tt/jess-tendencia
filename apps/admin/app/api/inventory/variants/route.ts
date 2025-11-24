import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const variants = await prisma.product_variants.findMany({
      select: {
        id: true,
        product_id: true,
        sku: true,
        size: true,
        color: true,
        stock: true,
        price_adjustment: true,
        is_active: true,
        products: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    })

    const variantsData = variants.map(v => ({
      id: v.id,
      productId: v.product_id,
      productName: v.products.name,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock || 0,
      priceAdjustment: v.price_adjustment || 0,
      isActive: v.is_active || false,
    }))

    return NextResponse.json({ success: true, data: variantsData })
  } catch (error) {
    console.error("Error al obtener variantes:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener variantes" },
      { status: 500 }
    )
  }
}
