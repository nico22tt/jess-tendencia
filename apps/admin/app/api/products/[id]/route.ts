import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT /api/products/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.urlSlug && { urlSlug: body.urlSlug }),
        ...(body.sku && { sku: body.sku }),
        ...(body.basePrice !== undefined && { basePrice: typeof body.basePrice === 'string' ? parseInt(body.basePrice) : body.basePrice }),
        ...(body.salePrice !== undefined && { 
          salePrice: body.salePrice ? (typeof body.salePrice === 'string' ? parseInt(body.salePrice) : body.salePrice) : null 
        }),
        ...(body.stock !== undefined && { stock: typeof body.stock === 'string' ? parseInt(body.stock) : body.stock }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.subcategory !== undefined && { subcategory: body.subcategory }),
        ...(body.brand && { brand: body.brand }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.images && { images: body.images })
      }
    })

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
