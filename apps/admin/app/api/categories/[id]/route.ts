import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/categories/:id - Obtener una categoría
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
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/:id - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, slug } = body

    // Verificar si la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Si se cambia el slug, verificar que no esté en uso
    if (slug && slug !== existingCategory.slug) {
      const slugInUse = await prisma.category.findUnique({
        where: { slug }
      })

      if (slugInUse) {
        return NextResponse.json(
          { success: false, error: 'El slug ya está en uso' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(slug && { slug })
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/:id - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si la categoría tiene productos
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true }
        }
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

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Categoría eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
