import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/orders/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order_items: {
          include: {
            products: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Error al obtener orden:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener orden' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const order = await prisma.orders.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.trackingNumber !== undefined && { tracking_number: body.trackingNumber }),
        ...(body.notes !== undefined && { notes: body.notes })
      },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Error al actualizar orden:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: params.id },
      include: { order_items: true }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Restaurar stock si la orden no fue entregada
    if (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
      for (const item of order.order_items) {
        await prisma.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }
    }

    await prisma.orders.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Orden eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar orden:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar orden' },
      { status: 500 }
    )
  }
}
