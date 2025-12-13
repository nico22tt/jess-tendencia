import { NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const startOfMonth = new Date(year, month, 1);
    const startOfNextMonth = new Date(year, month + 1, 1);

    console.log("Consultando visitas desde:", startOfMonth, "hasta:", startOfNextMonth);

    // Consulta raw para agrupar por día
    const results: Array<{ date: string; count: bigint }> = await prisma.$queryRaw`
      SELECT 
        to_char(date_trunc('day', timestamp), 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM page_visits
      WHERE timestamp >= ${startOfMonth} 
        AND timestamp < ${startOfNextMonth}
      GROUP BY date_trunc('day', timestamp)
      ORDER BY date ASC
    `;

    console.log(`Encontrados ${results.length} días con visitas`);

    // Mapea a shape del chart
    const data = results.map((r) => ({
      date: r.date,
      visitors: Number(r.count), // ✅ Cambié 'count' a 'visitors' para consistencia
    }));

    // Calcular total de visitantes del mes
    const total = data.reduce((sum, d) => sum + d.visitors, 0);

    // Obtener total de días transcurridos del mes
    const today = now.getDate();
    const averagePerDay = today > 0 ? Math.round(total / today) : 0;

    return NextResponse.json({
      success: true,
      data,
      summary: {
        total,
        daysWithData: data.length,
        averagePerDay,
        period: {
          start: startOfMonth.toISOString().split("T")[0],
          end: startOfNextMonth.toISOString().split("T")[0],
        },
      },
    });
  } catch (error) {
    console.error("Error obteniendo visitantes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron consultar las visitas",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [], // ✅ Array vacío para evitar crashes
      },
      { status: 500 }
    );
  }
}
