import { NextRequest, NextResponse } from "next/server"
import prisma from '@jess/shared/lib/prisma'

// Utilidad: Genera número de orden único (puedes mejorar con lógica secuencial)
const generateOrderNumber = () =>
  "ORD-" + Math.floor(Date.now() / 1000) + "-" + Math.floor(Math.random() * 10000)

export async function POST(req: NextRequest) {
  try {
    const {
      user_id,
      user_address_id,
      shipping_method, // delivery | retiro_loja
      client_name,
      client_email,
      client_phone,
      notes,
      items, // [{product_id, name, price, quantity, size}]
      shipping = 0,
      tax = 0,
    } = await req.json()

    if (
      !user_id ||
      !client_name ||
      !client_email ||
      !client_phone ||
      !Array.isArray(items) || items.length === 0
    ) {
      return NextResponse.json({ success: false, error: "Campos obligatorios faltantes." }, { status: 400 })
    }

    // Busca datos de dirección en BD para poblar campos de envío
    let shipping_address = "", shipping_city = "", shipping_region = "", shipping_zip = ""
    let shipping_recipient = client_name
    let shipping_phone = client_phone
    let shipping_email = client_email
    if (shipping_method === "delivery" && user_address_id) {
      const addr = await prisma.user_addresses.findUnique({ where: { id: user_address_id } })
      if (!addr) return NextResponse.json({ success: false, error: "Dirección de envío no encontrada." }, { status: 400 })
      shipping_recipient = addr.recipient_name || client_name
      shipping_phone = addr.phone_number || client_phone
      shipping_address = `${addr.address_line_1} ${addr.address_line_2 || ""}`.trim()
      shipping_city = addr.city
      shipping_region = addr.region
      shipping_zip = addr.zip_code
      shipping_email = client_email
    }
    // Cálculo de subtotal y total
    const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0)
    const total = subtotal + (shipping || 0) + (tax || 0)

    // Genera y crea orden + ítems
    const order = await prisma.orders.create({
      data: {
        order_number: generateOrderNumber(),
        user_id,
        status: "PENDING",
        subtotal,
        shipping: shipping || 0,
        tax: tax || 0,
        total,
        shipping_name: shipping_recipient,
        shipping_email,
        shipping_phone,
        shipping_address: shipping_address || "Retiro local", // Si es retiro, puedes poner un texto por defecto
        shipping_city: shipping_city || "Retiro local",
        shipping_region: shipping_region || "Retiro local",
        shipping_zip: shipping_zip || "0000000",
        notes: notes || "",
        payment_method: "WEBPAY",
        user_address_id: user_address_id || null,
        order_items: {
          create: items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity,
          }))
        }
      },
      include: {
        order_items: true
      }
    })

    return NextResponse.json({ success: true, order_id: order.id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error al crear orden" }, { status: 500 })
  }
}
