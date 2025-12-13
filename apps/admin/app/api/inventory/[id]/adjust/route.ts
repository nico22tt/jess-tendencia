import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"
import { getStockStatusType } from "@jess/shared/lib/notifications"
import { registerStockMovement } from "@jess/shared/lib/service"
import { registerShrinkageInCashFlow } from "@/lib/cash-flow-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, amount, note } = body

    // type: "add" | "subtract" | "set"
    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        stock: true,
        name: true,
        sku: true,
        last_cost: true, // ✅ CORREGIDO: es last_cost, no cost
        basePrice: true, // ✅ AGREGAR: precio de venta como fallback
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    const previousStock = product.stock ?? 0
    let movementType: "PURCHASE" | "SALE" | "ADJUSTMENT"
    let movementAmount: number

    // Traducción de la UI actual a tipos de movimiento realistas
    if (type === "add") {
      movementType = "PURCHASE" // entrada de inventario
      movementAmount = amount // +cantidad
    } else if (type === "subtract") {
      movementType = "ADJUSTMENT" // salida por merma/ajuste
      movementAmount = -amount // -cantidad
    } else {
      // "set" => ajuste directo al valor indicado
      movementType = "ADJUSTMENT"
      movementAmount = amount - previousStock
    }

    // Ejecutar todo en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Registrar movimiento y actualizar stock usando el servicio
      const { newStock } = await registerStockMovement({
        productId: id,
        type: movementType,
        amount: movementAmount,
        reason: note,
        userId: null,
      })

      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          stock: newStock,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          updatedAt: true,
        },
      })

      // Notificación "inventario ajustado"
      await tx.notification.create({
        data: {
          type: "stock_adjusted",
          title: "Inventario ajustado",
          message: `Se ajustó el stock de "${product.name}" (SKU: ${product.sku}) de ${previousStock} a ${newStock} unidades`,
          productId: id,
        },
      })

      // Notificaciones de stock bajo/critico/agotado
      const minStock = 10
      const stockStatusType = getStockStatusType(newStock, minStock)

      if (stockStatusType) {
        let statusTitle = ""
        let statusMessage = ""

        if (stockStatusType === "stock_out") {
          statusTitle = "⚠️ Producto agotado"
          statusMessage = `"${product.name}" (SKU: ${product.sku}) está agotado. Stock: 0 unidades`
        } else if (stockStatusType === "stock_critical") {
          statusTitle = "⚠️ Stock crítico"
          statusMessage = `"${product.name}" (SKU: ${product.sku}) tiene stock crítico: ${newStock} unidades (mínimo: ${minStock})`
        } else if (stockStatusType === "stock_low") {
          statusTitle = "⚠️ Stock bajo"
          statusMessage = `"${product.name}" (SKU: ${product.sku}) tiene stock bajo: ${newStock} unidades (mínimo: ${minStock})`
        }

        await tx.notification.create({
          data: {
            type: stockStatusType,
            title: statusTitle,
            message: statusMessage,
            productId: id,
          },
        })
      }

      return updatedProduct
    })

    // ✅ Si hubo reducción de stock (merma), registrar en cash flow
      if (movementAmount < 0) {
        try {
          // Usar last_cost, si no existe usar basePrice, si no existe usar 0
          const unitCost = product.last_cost 
            ? Number(product.last_cost) 
            : (product.basePrice || 0) // ✅ Fallback al precio de venta

          const shrinkageQuantity = Math.abs(movementAmount)

          await registerShrinkageInCashFlow({
            productId: id,
            productName: product.name,
            productSku: product.sku,
            quantity: shrinkageQuantity,
            unitCost: unitCost,
            reason: note || "Ajuste de inventario negativo",
          })

          console.log(
            `✓ Merma registrada en cash flow: ${product.name} - ${shrinkageQuantity} unidades - $${shrinkageQuantity * unitCost}`
          )
        } catch (cashFlowError) {
          console.error("Error registrando merma en cash flow:", cashFlowError)
        }
      }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        stock: result.stock,
        lastUpdated: result.updatedAt
          ? result.updatedAt.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("Error al ajustar stock:", error)
    return NextResponse.json(
      { success: false, error: "Error al ajustar stock" },
      { status: 500 }
    )
  }
}
