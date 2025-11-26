import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        product_variants: {
          select: {
            id: true,
            size: true,
            color: true,
            sku: true,
            stock: true,
            price_adjustment: true
          }
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Conversión segura de imágenes: SOLO strings válidas, nunca boolean, nil, number, etc
    let images: string[] = []
    try {
      if (Array.isArray(product.images)) {
        images = product.images
          .map(val => (typeof val === "string" && val.trim() ? val : undefined))
          .filter((img): img is string => typeof img === "string")
      } else if (typeof product.images === "string") {
        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) {
            images = parsed
              .map((img: any) => (typeof img === "string" && img.trim() ? img : undefined))
              .filter((img: any): img is string => typeof img === "string")
          } else if (product.images.trim()) {
            images = [product.images]
          }
        } catch {
          if (product.images.trim()) images = [product.images]
        }
      } else {
        images = []
      }
    } catch {
      images = []
    }

    // Categorías que realmente tienen tallas
    const categoriesWithSizes = ["jeans", "zapatillas", "botas", "botines", "pantuflas"];
    const categoryName = product.category?.name?.toLowerCase() || "";

    let sizes: string[] = [];
    if (categoriesWithSizes.includes(categoryName)) {
      sizes = [
        ...new Set(
          (product.product_variants ?? [])
            .map((v: any) => v.size)
            .filter(Boolean)
        ),
      ];
    }

    const safeProduct = {
      ...product,
      images,
      ...(sizes.length ? { sizes } : {}) // solo agrega sizes si corresponde y existe
    }

    return NextResponse.json({
      success: true,
      data: safeProduct,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al buscar producto' },
      { status: 500 }
    )
  }
}
