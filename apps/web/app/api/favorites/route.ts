import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

// POST /api/favorites  -> agregar a favoritos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    console.log("POST /api/favorites - Input:", { userId, productId })

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "Faltan datos: userId y productId requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Verificar/crear usuario en public.users (igual que en /api/cart)
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "unknown@sync.com",
          name: "Usuario sincronizado",
          role: "client",
        },
      })
      console.log("Usuario creado (favorites):", user.id)
    }

    // Upsert en favorite_items (único por user+product)
    const item = await prisma.favorite_items.upsert({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
      create: {
        user_id: userId,
        product_id: productId,
        created_at: new Date(),
      },
      update: {}, // no hay campos que actualizar, solo asegurar que exista
    })

    console.log("Favorito agregado:", item)
    return NextResponse.json({
      success: true,
      item,
      message: "Producto agregado a favoritos",
    })
  } catch (error: any) {
    console.error("Error detallado /favorites POST:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    return NextResponse.json(
      {
        error: "Error al agregar producto a favoritos",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// GET /api/favorites?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 })
  }

  try {
    // Verificar/crear usuario
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "unknown@sync.com",
          name: "Usuario sincronizado",
          role: "client",
        },
      })
    }

    const favorites = await prisma.favorite_items.findMany({
      where: { user_id: userId },
      include: { products: true }, // relación Product en Prisma
    })

    return NextResponse.json(favorites)
  } catch (error: any) {
    console.error("Error al obtener favoritos:", error)
    return NextResponse.json(
      { error: "Error al obtener favoritos" },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites?userId=...&productId=...
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const productId = searchParams.get("productId")

  console.log("DELETE /api/favorites - Input:", { userId, productId })

  if (!userId || !productId) {
    return NextResponse.json(
      { error: "Faltan datos: userId y productId requeridos" },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.favorite_items.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Producto no está en favoritos" },
        { status: 404 }
      )
    }

    await prisma.favorite_items.delete({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    })

    console.log("Favorito eliminado:", { userId, productId })
    return NextResponse.json({
      success: true,
      message: "Producto eliminado de favoritos",
    })
  } catch (error: any) {
    console.error("Error DELETE /favorites:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    return NextResponse.json(
      { error: "Error al eliminar producto de favoritos" },
      { status: 500 }
    )
  }
}
