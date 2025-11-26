import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

// Obtener todos los productos en el carrito de un usuario
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "Falta userId" }, { status: 400 })

  try {
    const items = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: { product: true } // Si quieres traer datos de producto
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}

// Agregar producto (¡o sumar cantidad!) al carrito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1 } = body

    if (!userId || !productId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const item = await prisma.cartItem.upsert({
      where: { user_id_product_id: { user_id: userId, product_id: productId }},
      update: { quantity: { increment: quantity } },
      create: { user_id: userId, product_id: productId, quantity }
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error al agregar producto:", error)
    return NextResponse.json({ error: "Error al agregar producto al carrito" }, { status: 500 })
  }
}

// Modificar la cantidad de un producto en el carrito
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity } = body

    if (!userId || !productId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Datos de entrada inválidos" }, { status: 400 })
    }

    const item = await prisma.cartItem.update({
      where: { user_id_product_id: { user_id: userId, product_id: productId }},
      data: { quantity }
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error al actualizar cantidad:", error)
    return NextResponse.json({ error: "Error al actualizar cantidad del carrito" }, { status: 500 })
  }
}

// Eliminar producto específico del carrito
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const productId = searchParams.get("productId")
  if (!userId || !productId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 })

  try {
    await prisma.cartItem.delete({
      where: { user_id_product_id: { user_id: userId, product_id: productId }}
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto del carrito" }, { status: 500 })
  }
}
