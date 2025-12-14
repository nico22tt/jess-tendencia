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

    // Agrupar por mes con número de mes para ordenar
    const monthlyData = new Map<string, { 
      income: number
      expense: number
      monthNumber: number 
    }>()

    entries.forEach((entry) => {
      const date = new Date(entry.date)
      const monthNumber = date.getMonth() + 1 // 1-12
      
      // Formato: "ene." "feb." etc.
      const month = date.toLocaleDateString("es-CL", {
        month: "short",
      })

      // Clave única: "1-ene." "2-feb." etc.
      const key = `${monthNumber}-${month}`

      if (!monthlyData.has(key)) {
        monthlyData.set(key, { income: 0, expense: 0, monthNumber })
      }

      const data = monthlyData.get(key)!
      if (entry.type === "INCOME") {
        data.income += entry.amount
      } else {
        data.expense += entry.amount
      }
    })

    // Convertir a array y ordenar cronológicamente
    const data = Array.from(monthlyData.entries())
      .map(([key, values]) => ({
        month: key.split('-')[1], // Solo "ene." sin el número
        monthNumber: values.monthNumber,
        income: values.income,
        expense: values.expense,
        balance: values.income - values.expense,
      }))
      .sort((a, b) => a.monthNumber - b.monthNumber) // ✅ Ordenar por número de mes

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching monthly cash flow:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener datos mensuales" },
      { status: 500 }
    )
  }
}
