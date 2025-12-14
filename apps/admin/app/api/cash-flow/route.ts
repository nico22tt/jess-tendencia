import { NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET() {
  try {
    const entries = await prisma.cash_flow.findMany({
      orderBy: {
        date: "desc",
      },
      take: 50, // Últimos 50 movimientos
    })

    return NextResponse.json({
      success: true,
      data: entries,
    })
  } catch (error) {
    console.error("Error fetching cash flow:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener flujo de caja",
      },
      { status: 500 }
    )
  }
}
