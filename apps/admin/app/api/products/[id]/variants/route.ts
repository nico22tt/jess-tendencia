import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/products/:id/variants - Obtener variantes de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variants = await prisma.product_variants.findMany({
      where: { product_id: params.id },
      orderBy: { size: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: variants
    })
  } catch (error) {
    console.error('Error al obtener variantes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener variantes' },
      { status: 500 }
    )
  }
}

// POST /api/products/:id/variants - Crear variante
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { size, color, stock, priceAdjustment, sku } = body

    // Validar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Crear variante
    const variant = await prisma.product_variants.create({
      data: {
        product_id: params.id,
        sku: sku || `${product.sku}-${size}${color ? `-${color}` : ''}`,
        size: size || null,
        color: color || null,
        stock: stock || 0,
        price_adjustment: priceAdjustment || 0,
        is_active: true
      }
    })

    return NextResponse.json({
      success: true,
      data: variant
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear variante:', error)

    // Error de duplicate SKU
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Ya existe una variante con ese SKU' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al crear variante' },
      { status: 500 }
    )
  }
}
