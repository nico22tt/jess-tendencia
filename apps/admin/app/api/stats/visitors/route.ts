import { NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";
  // Ajusta ruta si tu prisma client está en otro lugar

export async function GET() {
  try {
    // Obtener visitas desde el día 1 al final del mes actual
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const startOfMonth = new Date(year, month, 1);
    const startOfNextMonth = new Date(year, month + 1, 1);

    // Consulta raw para agrupar por día
    const results: Array<{ date: string; count: bigint }> = await prisma.$queryRaw`
      SELECT 
        to_char(date_trunc('day', timestamp), 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM public.page_visits
      WHERE timestamp >= ${startOfMonth} AND timestamp < ${startOfNextMonth}
      GROUP BY date
      ORDER BY date ASC;
    `;

    // Mapea a shape del chart
    const data = results.map(r => ({
      date: r.date,
      count: Number(r.count)
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error obteniendo visitantes:", error);
    return NextResponse.json({ error: "No se pudieron consultar las visitas" }, { status: 500 });
  }
}
