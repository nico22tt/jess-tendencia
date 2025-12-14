// packages/shared/lib/service.ts
import prisma from "./prisma"

export async function getProductStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  })

  return product?.stock ?? 0
}

type MovementType = "PURCHASE" | "SALE" | "ADJUSTMENT"

interface RegisterStockMovementParams {
  productId: string
  type: MovementType
  amount: number // positivo = entra, negativo = sale
  reason?: string
  userId?: string | null
}

export async function registerStockMovement({
  productId,
  type,
  amount,
  reason,
  userId,
}: RegisterStockMovementParams) {
  const previousStock = await getProductStock(productId)
  const newStock = previousStock + amount

  if (newStock < 0) {
    throw new Error(
      `Stock insuficiente. Stock actual: ${previousStock}, cambio: ${amount}`
    )
  }

  const movement = await prisma.stockMovement.create({
    data: {
      productId,
      type,
      quantity: amount, // ✅ CORREGIDO: era "amount", ahora es "quantity"
      previousStock,
      newStock,
      reason: reason || type,
      userId: userId ?? null,
    },
  })

  await prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
  })

  return { movement, previousStock, newStock }
}
