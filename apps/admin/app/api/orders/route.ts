import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/orders - Listar órdenes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (userId) {
      where.user_id = userId
    }

    const orders = await prisma.orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
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
            products: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Crear orden
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      items,
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingRegion,
      shippingZip,
      shippingCost = 0,
      paymentMethod,
      notes
    } = body

    // Validaciones
    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios' },
        { status: 400 }
      )
    }

    if (!shippingName || !shippingEmail || !shippingPhone || !shippingAddress || !shippingCity || !shippingRegion || !shippingZip) {
      return NextResponse.json(
        { success: false, error: 'Información de envío incompleta' },
        { status: 400 }
      )
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0
    )
    const tax = 0
    const total = subtotal + shippingCost + tax

    // Generar número de orden único
    const orderCount = await prisma.orders.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

    // Crear orden con items
    const order = await prisma.orders.create({
      data: {
        order_number: orderNumber,
        user_id: userId,
        status: 'PENDING',
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        shipping_name: shippingName,
        shipping_email: shippingEmail,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_region: shippingRegion,
        shipping_zip: shippingZip,
        payment_method: paymentMethod,
        notes,
        order_items: {
          create: items.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
          }))
        }
      },
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

    // Actualizar stock de productos
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear orden:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear orden' },
      { status: 500 }
    )
  }
}
