import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/products/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: {
        category: true
      }
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Producto eliminado' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
