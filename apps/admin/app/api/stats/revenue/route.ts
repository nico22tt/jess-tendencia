import { NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Inicio y fin del año actual en la zona horaria local
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const ordenes = await prisma.orders.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
        status: {
          in: ["SUCCESS", "COMPLETED", "DELIVERED", "PAID"], // ✅ Corregido
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const data = meses.map((nombreMes, i) => {
      const delMes = ordenes.filter((o) => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === i;
      });

      const total = delMes.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

      return {
        month: nombreMes,
        total: Math.round(total), // Redondear a entero
        successful: delMes.length,
      };
    });

    // Calcular totales
    const totalRevenue = data.reduce((sum, m) => sum + m.total, 0);
    const totalOrders = data.reduce((sum, m) => sum + m.successful, 0);

    return NextResponse.json({
      success: true,
      data,
      year: currentYear,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      },
    });
  } catch (error) {
    console.error("Error consultando ingresos:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error generando reporte de ingresos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
