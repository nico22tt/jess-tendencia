import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            basePrice: true,
            stock: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Categoría no encontrada'
      }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, slug } = await request.json()

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(slug !== undefined && { slug }),
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true } }
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una categoría con productos' },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true, message: 'Categoría eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
