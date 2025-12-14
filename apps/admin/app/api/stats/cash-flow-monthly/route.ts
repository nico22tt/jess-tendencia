import { NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)

    const entries = await prisma.cash_flow.findMany({
      where: {
        date: {
          gte: startOfYear,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
    })

    // Agrupar por mes
    const monthlyData = new Map<string, { income: number; expense: number }>()

    entries.forEach((entry) => {
      const month = new Date(entry.date).toLocaleDateString("es-CL", {
        month: "short",
      })

      if (!monthlyData.has(month)) {
        monthlyData.set(month, { income: 0, expense: 0 })
      }

      const data = monthlyData.get(month)!
      if (entry.type === "INCOME") {
        data.income += entry.amount
      } else {
        data.expense += entry.amount
      }
    })

    const data = Array.from(monthlyData.entries()).map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching monthly cash flow:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener datos mensuales" },
      { status: 500 }
    )
  }
}
