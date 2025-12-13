import { NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.orders.findMany({
      where: {
        status: { 
          in: ["SUCCESS", "COMPLETED", "DELIVERED", "PAID"]
        },
      },
      select: {
        id: true,
        order_number: true,
        shipping_name: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const data = transactions.map((t) => ({
      id: t.id,
      name: t.shipping_name || "Cliente sin nombre",
      amount: Number(t.total ?? 0),
      orderNumber: t.order_number,
      status: t.status,
      date: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error obteniendo transacciones:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error consultando transacciones",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
