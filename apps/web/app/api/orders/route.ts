import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";
import { registerStockMovement } from "@jess/shared/lib/service";

const generateOrderNumber = () =>
  "ORD-" +
  Math.floor(Date.now() / 1000) +
  "-" +
  Math.floor(Math.random() * 10000);

// GET /api/orders?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Falta userId" },
      { status: 400 }
    );
  }

  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" }, // ✅ snake_case
      include: {
        order_items: {
          include: {
            products: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Error al listar órdenes" },
      { status: 500 }
    );
  }
}

// POST /api/orders
// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const {
      user_id,
      user_address_id,
      shipping_method,
      client_name,
      client_email,
      client_phone,
      notes,
      items,
      shipping = 0,
      tax = 0,
    } = await req.json();

    if (
      !user_id ||
      !client_name ||
      !client_email ||
      !client_phone ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios faltantes." },
        { status: 400 }
      );
    }

    // ✅ VALIDAR que no sea el usuario sincronizado
    if (user_id === '25f597bd-fd93-4aa7-b50d-4900199cf474') {
      return NextResponse.json(
        { success: false, error: "Usuario no válido. Por favor inicie sesión nuevamente." },
        { status: 401 }
      );
    }

    // Busca datos de dirección en BD para poblar campos de envío
    let shipping_address = "",
      shipping_city = "",
      shipping_region = "",
      shipping_zip = "";
    let shipping_recipient = client_name;
    let shipping_phone = client_phone;
    let shipping_email = client_email;

    if (shipping_method === "delivery" && user_address_id) {
      const addr = await prisma.user_addresses.findUnique({
        where: { id: user_address_id },
      });
      if (!addr) {
        return NextResponse.json(
          { success: false, error: "Dirección de envío no encontrada." },
          { status: 400 }
        );
      }
      shipping_recipient = addr.recipient_name || client_name;
      shipping_phone = addr.phone_number || client_phone;
      shipping_address = `${addr.address_line_1} ${
        addr.address_line_2 || ""
      }`.trim();
      shipping_city = addr.city;
      shipping_region = addr.region;
      shipping_zip = addr.zip_code;
      shipping_email = client_email;
    }

    const subtotal = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0
    );
    const total = subtotal + (shipping || 0) + (tax || 0);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.orders.create({
        data: {
          order_number: generateOrderNumber(),
          user_id,
          status: "PAID", // ✅ Cambiar a PAID directamente
          payment_status: "PAID", // ✅ Cambiar a PAID directamente
          paid_at: new Date(), // ✅ Agregar fecha de pago
          subtotal,
          shipping: shipping || 0,
          tax: tax || 0,
          total,
          shipping_name: shipping_recipient,
          shipping_email,
          shipping_phone,
          shipping_address: shipping_address || "Retiro local",
          shipping_city: shipping_city || "Retiro local",
          shipping_region: shipping_region || "Retiro local",
          shipping_zip: shipping_zip || "0000000",
          notes: notes || "",
          payment_method: "WEBPAY",
          user_address_id: user_address_id || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          order_items: {
            create: items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
        include: {
          order_items: true,
        },
      });

      for (const item of createdOrder.order_items) {
        await registerStockMovement({
          productId: item.product_id,
          type: "SALE",
          amount: -item.quantity,
          reason: `Venta orden #${createdOrder.order_number}`,
          userId: user_id,
        });
      }

      return createdOrder;
    });

    console.log("✅ Orden creada como PAID:", order.order_number);

    return NextResponse.json({ success: true, order_id: order.id });
  } catch (err: any) {
    console.error("Error al crear orden:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al crear orden" },
      { status: 500 }
    );
  }
}
