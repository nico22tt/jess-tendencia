import { NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// Detecta el navegador principal a partir del user agent
function parseBrowser(ua: string | null) {
  if (!ua) return "Otros";
  if (/edg|edge/i.test(ua)) return "Edge";
  if (/chrome|chromium|crios/i.test(ua) && !/edg|edge|opr|opera/i.test(ua))
    return "Chrome";
  if (
    /safari/i.test(ua) &&
    !/chrome|chromium|crios|opr|opera|edg|edge/i.test(ua)
  )
    return "Safari";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  return "Otros";
}

// Colores para cada navegador
const browserColors: Record<string, string> = {
  Chrome: "#4285F4",
  Safari: "#000000",
  Firefox: "#FF7139",
  Edge: "#0078D7",
  Otros: "#999999",
};

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 1);

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
    });

    const browserMap: Record<string, number> = {};
    visits.forEach((visit) => {
      const name = parseBrowser(visit.user_agent || "Otros");
      browserMap[name] = (browserMap[name] || 0) + 1;
    });

    const data = Object.entries(browserMap)
      .map(([name, value]) => ({
        name,
        value,
        color: browserColors[name] || "#999999", // ✅ Agregar color
      }))
      .sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return NextResponse.json({
      success: true,
      data,
      total,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error obteniendo navegadores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron consultar los navegadores",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
