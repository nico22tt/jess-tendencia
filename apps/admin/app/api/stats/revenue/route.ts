import { NextResponse } from "next/server"
import prisma from "@lib/prisma"

export async function GET() {
  try {
    const año = new Date().getFullYear()

    const ordenes = await prisma.orders.findMany({
      where: {
        createdAt: {
          gte: new Date(`${año}-01-01T00:00:00.000Z`),
          lte: new Date(`${año}-12-31T23:59:59.999Z`),
        },
        status: {
          in: ["SUCCESS", "COMPLETADO", "PAID"],
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    })

    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

    const data = meses.map((nombreMes, i) => {
      const delMes = ordenes.filter(
        (o) => o.createdAt && new Date(o.createdAt).getMonth() === i
      )

      return {
        month: nombreMes,
        total: delMes.reduce(
          (sum: number, o) => sum + Number(o.total ?? 0),
          0
        ),
        successful: delMes.length,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error consultando ingresos:", error)
    return NextResponse.json(
      { error: "Error generando reporte de ingresos" },
      { status: 500 }
    )
  }
}
