import { NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Total ingresos (todos los tiempos)
    const totalIncome = await prisma.cash_flow.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    })

    // Total gastos (todos los tiempos)
    const totalExpense = await prisma.cash_flow.aggregate({
      where: { type: "EXPENSE" },
      _sum: { amount: true },
    })

    // Ingresos este mes
    const monthIncome = await prisma.cash_flow.aggregate({
      where: {
        type: "INCOME",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    })

    // Gastos este mes
    const monthExpense = await prisma.cash_flow.aggregate({
      where: {
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    })

    const data = {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpense: totalExpense._sum.amount || 0,
      balance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
      thisMonth: {
        income: monthIncome._sum.amount || 0,
        expense: monthExpense._sum.amount || 0,
      },
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error getting cash flow summary:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener resumen de flujo de caja" },
      { status: 500 }
    )
  }
}
