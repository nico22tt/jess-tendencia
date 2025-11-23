import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// PUT /api/products/:id/variants/:variantId - Actualizar variante
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, variantId: string } }
) {
  try {
    const body = await request.json()

    const variant = await prisma.product_variants.update({
      where: { id: params.variantId },
      data: {
        ...(body.size !== undefined && { size: body.size }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.priceAdjustment !== undefined && { price_adjustment: body.priceAdjustment }),
        ...(body.isActive !== undefined && { is_active: body.isActive })
      }
    })

    return NextResponse.json({
      success: true,
      data: variant
    })
  } catch (error) {
    console.error('Error al actualizar variante:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar variante' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id/variants/:variantId - Eliminar variante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, variantId: string } }
) {
  try {
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
