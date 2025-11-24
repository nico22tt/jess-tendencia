import prisma from "./prisma"

export async function createNotification({
  type,
  title,
  message,
  productId,
  orderId,
}: {
  type: string
  title: string
  message: string
  productId?: string
  orderId?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        productId,
        orderId,
        isRead: false,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

export function getStockStatusType(stock: number, minStock: number): string | null {
  if (stock === 0) return "stock_out"
  if (stock <= minStock * 0.3) return "stock_critical"
  if (stock <= minStock) return "stock_low"
  return null
}
