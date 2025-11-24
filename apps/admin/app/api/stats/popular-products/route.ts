import { NextResponse } from "next/server"
import prisma from "@lib/prisma"

export async function GET() {
  try {
    // Productos más vendidos del año actual, agrupando por producto
    const year = new Date().getFullYear()

    const popularProducts = await prisma.$queryRaw<Array<{
      product_id: string;
      product_name: string;
      total_quantity: bigint;
      total_sales: bigint;
    }>>`
      SELECT
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * p.price) as total_sales
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= ${new Date(`${year}-01-01`)}
        AND o.status IN ('SUCCESS', 'COMPLETADO', 'PAID')
      GROUP BY p.id, p.name
      ORDER BY total_sales DESC
      LIMIT 4
    `

    // Si la query falla y popularProducts no es array, devolvemos array vacío
    const data = Array.isArray(popularProducts)
      ? popularProducts.map(p => ({
          id: p.product_id,
          name: p.product_name,
          totalQuantity: Number(p.total_quantity),
          totalSales: Number(p.total_sales)
        }))
      : []

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error obteniendo productos populares:", error)
    return NextResponse.json([]) // Devuelve array vacío en caso de error
  }
}
