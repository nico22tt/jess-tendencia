import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET - Estadísticas del módulo de compras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtro de fechas
    const dateFilter = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };

    const hasDateFilter = startDate || endDate;

    // 1. Total de órdenes por estado
    const ordersByStatus = await prisma.purchase_orders.groupBy({
      by: ["status"],
      where: hasDateFilter ? { order_date: dateFilter } : {},
      _count: { id: true },
      _sum: { total: true },
    });

    // 2. Total gastado
    const totalSpent = await prisma.purchase_orders.aggregate({
      where: {
        status: { not: "CANCELLED" },
        ...(hasDateFilter ? { order_date: dateFilter } : {}),
      },
      _sum: { total: true },
    });

    // 3. Órdenes pendientes de pago
    const pendingPayment = await prisma.purchase_orders.aggregate({
      where: {
        payment_status: "PENDING",
        status: { not: "CANCELLED" },
      },
      _count: { id: true },
      _sum: { total: true },
    });

    // 4. Top 5 proveedores (por monto)
    const topSuppliers = await prisma.purchase_orders.groupBy({
      by: ["supplier_id"],
      where: {
        status: { not: "CANCELLED" },
        ...(hasDateFilter ? { order_date: dateFilter } : {}),
      },
      _sum: { total: true },
      _count: { id: true },
      orderBy: {
        _sum: { total: "desc" },
      },
      take: 5,
    });

    // Obtener datos de los proveedores
    const supplierIds = topSuppliers.map((s) => s.supplier_id);
    const suppliers = await prisma.suppliers.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true },
    });

    const topSuppliersWithNames = topSuppliers.map((item) => {
      const supplier = suppliers.find((s) => s.id === item.supplier_id);
      return {
        supplierId: item.supplier_id,
        supplierName: supplier?.name || "Desconocido",
        totalOrders: item._count.id,
        totalAmount: item._sum.total?.toString() || "0",
      };
    });

    // 5. Productos más comprados (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topProducts = await prisma.purchase_order_items.groupBy({
      by: ["product_id"],
      where: {
        purchase_orders: {
          order_date: { gte: hasDateFilter && startDate ? new Date(startDate) : thirtyDaysAgo },
          status: { not: "CANCELLED" },
        },
      },
      _sum: { quantity_received: true },
      _count: { id: true },
      orderBy: {
        _sum: { quantity_received: "desc" },
      },
      take: 5,
    });

    // Obtener datos de los productos
    const productIds = topProducts.map((p) => p.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });

    const topProductsWithNames = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        productId: item.product_id,
        productName: product?.name || "Desconocido",
        sku: product?.sku || "N/A",
        totalReceived: item._sum.quantity_received || 0,
        orderCount: item._count.id,
      };
    });

    // 6. Proveedores activos
    const activeSuppliers = await prisma.suppliers.count({
      where: { is_active: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSpent: totalSpent._sum.total?.toString() || "0",
          activeSuppliers,
          pendingPayment: {
            count: pendingPayment._count.id,
            amount: pendingPayment._sum.total?.toString() || "0",
          },
        },
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
          total: item._sum.total?.toString() || "0",
        })),
        topSuppliers: topSuppliersWithNames,
        topProducts: topProductsWithNames,
      },
    });
  } catch (error) {
    console.error("Error fetching purchase stats:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
