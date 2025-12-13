import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET - Reporte de valorización de inventario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // Obtener productos con stock
    const products = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        ...(categoryId ? { categoryId } : {}),
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        average_cost: true,
        last_cost: true,
        basePrice: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    let totalStockValue = 0;
    let totalPotentialRevenue = 0;

    const enrichedProducts = products.map((product) => {
      const averageCost = product.average_cost
        ? parseFloat(product.average_cost.toString())
        : 0;
      const stockValue = averageCost * (product.stock || 0);
      const potentialRevenue = product.basePrice * (product.stock || 0);
      const potentialProfit = potentialRevenue - stockValue;

      totalStockValue += stockValue;
      totalPotentialRevenue += potentialRevenue;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        stock: product.stock,
        averageCost: averageCost.toFixed(2),
        lastCost: product.last_cost
          ? parseFloat(product.last_cost.toString()).toFixed(2)
          : "0.00",
        basePrice: product.basePrice.toFixed(2),
        stockValue: stockValue.toFixed(2),
        potentialRevenue: potentialRevenue.toFixed(2),
        potentialProfit: potentialProfit.toFixed(2),
        profitMargin:
          potentialRevenue > 0
            ? ((potentialProfit / potentialRevenue) * 100).toFixed(2)
            : "0.00",
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalStockValue: totalStockValue.toFixed(2),
          totalPotentialRevenue: totalPotentialRevenue.toFixed(2),
          totalPotentialProfit: (totalPotentialRevenue - totalStockValue).toFixed(2),
          averageMargin:
            totalPotentialRevenue > 0
              ? (
                  ((totalPotentialRevenue - totalStockValue) /
                    totalPotentialRevenue) *
                  100
                ).toFixed(2)
              : "0.00",
        },
        products: enrichedProducts,
      },
    });
  } catch (error) {
    console.error("Error generating stock value report:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
