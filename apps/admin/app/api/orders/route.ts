import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where =
      status && status !== "all"
        ? { status }
        : {}

    const orders = await prisma.orders.findMany({
      where,
      orderBy: { createdAt: "desc" }, // ✅ snake_case
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: { // ✅ snake_case
          include: {
            products: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // ✅ Serializar y transformar a camelCase para el frontend
    const serializedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number, // ✅ Transformar a camelCase
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingName: order.shipping_name,
      shippingEmail: order.shipping_email,
      shippingPhone: order.shipping_phone,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingRegion: order.shipping_region,
      shippingZip: order.shipping_zip,
      notes: order.notes,
      trackingNumber: order.tracking_number,
      paymentMethod: order.payment_method,
      createdAt: order.createdAt?.toISOString() || null, // ✅ Manejar null
      updatedAt: order.updatedAt?.toISOString() || null,
      paidAt: order.paid_at?.toISOString() || null,
      users: order.users, // ✅ Ya viene con la estructura correcta
      orderItems: order.order_items.map(item => ({ // ✅ Transformar a camelCase
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal,
        products: item.products,
      })),
    }))

    return NextResponse.json({ success: true, data: serializedOrders })
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener órdenes" },
      { status: 500 }
    )
  }
}
