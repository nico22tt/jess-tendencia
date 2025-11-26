import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { 
            products: true,
            children: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, slug, imageUrl, parentId, displayOrder, isActive } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Nombre y slug son requeridos' },
        { status: 400 }
      )
    }

    const exists = await prisma.category.findUnique({ where: { slug } })
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'El slug ya está en uso' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: isActive ?? true,
      }
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}
