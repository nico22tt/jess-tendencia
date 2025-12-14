import { NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

// ✅ Función helper para parsear imágenes (igual que en el frontend)
const parseProductImages = (images: any): string[] => {
  let arr: Array<string | { url: string; isMain?: boolean }> = []

  // Si es un array
  if (Array.isArray(images)) {
    // Si son strings directos
    if (typeof images[0] === "string") {
      arr = images.filter((img) => typeof img === "string" && img.trim())
    } else {
      // Si son objetos con url
      arr = images
    }
  }
  // Si es un string JSON, parsearlo
  else if (typeof images === "string" && images.trim()) {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) arr = parsed
    } catch {
      arr = []
    }
  }
  // Si es un objeto único
  else if (images && typeof images === "object") {
    arr = [images]
  }

  // Convertir todo a strings
  const urlStrings = arr
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter((url): url is string => !!url && url.trim() !== "")

  return urlStrings.length > 0 ? urlStrings : []
}

export async function GET() {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0)
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999)

    console.log("Fetching popular products with Prisma ORM...")

    // ✅ Obtener los IDs de las categorías permitidas
    const allowedCategoryNames = ["Accesorios", "Gorros", "Ropa", "Niños-Kids", "Kits"]

    const allowedCategories = await prisma.category.findMany({
      where: {
        name: {
          in: allowedCategoryNames,
        },
      },
      select: {
        id: true,
      },
    })

    const allowedCategoryIds = allowedCategories.map((c) => c.id)

    console.log(`Found ${allowedCategoryIds.length} allowed categories`)

    // ✅ Filtrar por esos IDs de categorías
    const orderItems = await prisma.order_items.findMany({
      where: {
        orders: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
          status: {
            in: ["SUCCESS", "COMPLETED", "DELIVERED", "PAID"],
          },
        },
        products: {
          categoryId: {
            in: allowedCategoryIds,
          },
        },
      },
      select: {
        product_id: true,
        quantity: true,
        subtotal: true,
        order_id: true,
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            images: true,
          },
        },
      },
    })

    console.log(`Found ${orderItems.length} order items`)

    // ✅ Agrupar por producto y calcular totales
    interface ProductStat {
      id: string
      name: string
      sku: string
      images: any
      totalQuantity: number
      totalSales: number
      orderIds: Set<string>
    }

    const productStats = new Map<string, ProductStat>()

    orderItems.forEach((item) => {
      const productId = item.product_id
      const existing = productStats.get(productId)

      if (existing) {
        existing.totalQuantity += item.quantity
        existing.totalSales += item.subtotal
        existing.orderIds.add(item.order_id)
      } else {
        productStats.set(productId, {
          id: item.products.id,
          name: item.products.name,
          sku: item.products.sku,
          images: item.products.images,
          totalQuantity: item.quantity,
          totalSales: item.subtotal,
          orderIds: new Set([item.order_id]),
        })
      }
    })

    // ✅ Convertir a array y ordenar por ventas
    const sortedProducts = Array.from(productStats.values())
      .map((product) => {
        // ✅ Usar la función de parsing
        const parsedImages = parseProductImages(product.images)
        const imageUrl = parsedImages.length > 0 ? parsedImages[0] : null

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          image: imageUrl,
          totalQuantity: product.totalQuantity,
          totalSales: product.totalSales,
          ordersCount: product.orderIds.size,
        }
      })
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5) // Top 5 productos

    console.log(
      `Top 5 products:`,
      sortedProducts.map((p) => `${p.name} - Image: ${p.image ? "✓" : "✗"}`)
    )

    return NextResponse.json({
      success: true,
      data: sortedProducts,
      year: currentYear,
      total: sortedProducts.length,
    })
  } catch (error) {
    console.error("❌ Error obteniendo productos populares:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error consultando productos populares",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 }
    )
  }
}
