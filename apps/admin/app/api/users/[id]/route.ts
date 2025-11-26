import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/users/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT /api/users/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl })
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // No permitir eliminar el último admin
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (user?.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'No puedes eliminar el último administrador' },
          { status: 400 }
        )
      }
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
