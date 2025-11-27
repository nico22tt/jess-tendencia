import { NextResponse } from "next/server"
import prisma from "@lib/prisma"

// Detecta el navegador principal a partir del user agent
function parseBrowser(ua: string | null) {
  if (!ua) return "Otros"
  if (/edg|edge/i.test(ua)) return "Edge"
  if (/chrome|chromium|crios/i.test(ua) && !/edg|edge|opr|opera/i.test(ua)) return "Chrome"
  if (/safari/i.test(ua) && !/chrome|chromium|crios|opr|opera|edg|edge/i.test(ua)) return "Safari"
  if (/firefox|fxios/i.test(ua)) return "Firefox"
  return "Otros"
}

export async function GET() {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const from = new Date(year, month, 1)
    const to = new Date(year, month + 1, 1)

    const visits = await prisma.pageVisit.findMany({
      where: {
        timestamp: {
          gte: from,
          lt: to,
        },
      },
      select: {
        user_agent: true,
      },
    })

    const browserMap: Record<string, number> = {}
    visits.forEach((visit) => {
      const name = parseBrowser(visit.user_agent || "Otros")
      browserMap[name] = (browserMap[name] || 0) + 1
    })

    const data = Object.entries(browserMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error obteniendo navegadores:", error)
    return NextResponse.json(
      { error: "No se pudieron consultar los navegadores" },
      { status: 500 }
    )
  }
}
