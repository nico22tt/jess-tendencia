import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

// GET /api/products/:id/variants
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const variants = await prisma.product_variants.findMany({
      where: { product_id: id },
      orderBy: { size: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: variants,
    })
  } catch (error) {
    console.error("Error al obtener variantes:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener variantes" },
      { status: 500 }
    )
  }
}

// POST /api/products/:id/variants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { size, color, stock, priceAdjustment, sku } = body

    // Validar que el producto exista
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Crear SKU automático (opcional)
    const generatedSku =
      sku || `${product.sku}${size ? "-" + size : ""}${color ? "-" + color : ""}`

    // Crear variante
    const variant = await prisma.product_variants.create({
      data: {
        product_id: id,
        sku: generatedSku,
        size: size || null,
        color: color || null,
        stock: stock ? Number(stock) : 0,
        price_adjustment: priceAdjustment ? Number(priceAdjustment) : 0,
        is_active: true,
      },
    })

    return NextResponse.json(
      { success: true, data: variant },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error al crear variante:", error)

    // SKU duplicado
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Ya existe una variante con ese SKU" },
        { status: 400 }
      )
    }

    // Violación del índice único (product_id, size, color)
    if (error.code === "23514" || error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe una variante con ese tamaño y color",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Error al crear variante" },
      { status: 500 }
    )
  }
}
