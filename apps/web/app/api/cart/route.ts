import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1 } = body

    console.log("POST /api/cart - Input:", { userId, productId, quantity })

    if (!userId || !productId) {
      return NextResponse.json({ error: "Faltan datos: userId y productId requeridos" }, { status: 400 })
    }

    // ✅ CRÍTICO: Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // ✅ CRÍTICO: Verificar/Crear usuario en tabla public.users
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Crear usuario si no existe (sync con Supabase Auth)
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "unknown@sync.com", // Placeholder, puedes obtenerlo de Supabase
          name: "Usuario sincronizado",
          role: "client"
        }
      })
      console.log("Usuario creado:", user.id)
    }

    // ✅ Ahora agregar al carrito
    const existingItem = await prisma.cart_items.findUnique({
      where: { 
        user_id_product_id: { 
          user_id: userId, 
          product_id: productId 
        } 
      }
    })

    let item
    if (existingItem) {
      item = await prisma.cart_items.update({
        where: { 
          user_id_product_id: { 
            user_id: userId, 
            product_id: productId 
          } 
        },
        data: { 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date()
        }
      })
    } else {
      item = await prisma.cart_items.create({
        data: { 
          user_id: userId, 
          product_id: productId, 
          quantity,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    }

    console.log("Carrito actualizado:", item)
    return NextResponse.json({ 
      success: true, 
      item,
      message: "Producto agregado al carrito" 
    })

  } catch (error: any) {
    console.error("Error detallado:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { 
        error: "Error al agregar producto al carrito", 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Mantén el resto igual (GET, PATCH, DELETE)...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "Falta userId" }, { status: 400 })

  try {
    // ✅ Verificar/crear usuario también aquí
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "unknown@sync.com",
          name: "Usuario sincronizado",
          role: "client"
        }
      })
    }

    const items = await prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { products: true },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}
