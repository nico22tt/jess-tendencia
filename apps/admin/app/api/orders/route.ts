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
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: {
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

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener órdenes" },
      { status: 500 }
    )
  }
}
