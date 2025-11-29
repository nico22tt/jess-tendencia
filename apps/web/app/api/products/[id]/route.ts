// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        product_variants: {
          select: {
            id: true,
            size: true,
            color: true,
            sku: true,
            stock: true,
            price_adjustment: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Aquí NO toques todavía las imágenes, deja que vengan igual que en /api/products
    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al buscar producto' },
      { status: 500 }
    )
  }
}
