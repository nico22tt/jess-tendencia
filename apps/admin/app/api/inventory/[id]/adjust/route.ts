import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"
import { createNotification, getStockStatusType } from "@jess/shared/lib/notifications"
import type { PrismaClient } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, amount, note } = body

    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true, name: true, sku: true }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    const previousStock = product.stock || 0
    let newStock = previousStock

    if (type === "add") {
      newStock += amount
    } else if (type === "subtract") {
      newStock = Math.max(0, newStock - amount)
    } else if (type === "set") {
      newStock = amount
    }

    const minStock = 10

    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          stock: newStock,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          updatedAt: true
        }
      })

      await tx.stockMovement.create({
        data: {
          productId: id,
          type: type === "add" ? "entry" : type === "subtract" ? "exit" : "adjustment",
          amount: type === "subtract" ? -amount : amount,
          previousStock,
          newStock,
          reason:
            note ||
            (type === "add"
              ? "Entrada manual"
              : type === "subtract"
              ? "Salida manual"
              : "Ajuste manual"),
          userId: null
        }
      })

      await tx.notification.create({
        data: {
          type: "stock_adjusted",
          title: "Inventario ajustado",
          message: `Se ajustó el stock de "${product.name}" (SKU: ${product.sku}) de ${previousStock} a ${newStock} unidades`,
          productId: id
        }
      })

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
            productId: id
          }
        })
      }

      return updatedProduct
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        stock: result.stock,
        lastUpdated: result.updatedAt
          ? result.updatedAt.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      }
    })
  } catch (error) {
    console.error("Error al ajustar stock:", error)
    return NextResponse.json(
      { success: false, error: "Error al ajustar stock" },
      { status: 500 }
    )
  }
}
