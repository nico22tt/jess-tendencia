import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// PUT /api/products/:id/variants/:variantId
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, variantId: string } }
) {
  try {
    const body = await request.json()

    // Verificar que la variante exista y pertenezca al producto
    const variant = await prisma.product_variants.findUnique({
      where: { id: params.variantId }
    })

    if (!variant || variant.product_id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'La variante no pertenece a este producto' },
        { status: 404 }
      )
    }

    const updated = await prisma.product_variants.update({
      where: { id: params.variantId },
      data: {
        ...(body.size !== undefined && { size: body.size }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.stock !== undefined && { stock: Number(body.stock) }),
        ...(body.priceAdjustment !== undefined && {
          price_adjustment: Number(body.priceAdjustment)
        }),
        ...(body.isActive !== undefined && { is_active: body.isActive }),
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error: any) {
    console.error('Error al actualizar variante:', error)

    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'SKU duplicado o variante ya existente' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar variante' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id/variants/:variantId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, variantId: string } }
) {
  try {
    const variant = await prisma.product_variants.findUnique({
      where: { id: params.variantId }
    })

    if (!variant || variant.product_id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'La variante no pertenece a este producto' },
        { status: 404 }
      )
    }

    await prisma.product_variants.delete({
      where: { id: params.variantId }
    })

    return NextResponse.json({
      success: true,
      message: 'Variante eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar variante:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar variante' },
      { status: 500 }
    )
  }
}
