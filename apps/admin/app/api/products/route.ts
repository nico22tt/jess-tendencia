import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/products - Listar productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const where = categoryId ? { categoryId } : {}

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST /api/products - Crear producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      urlSlug,
      sku,
      basePrice,
      salePrice,
      stock,
      categoryId,
      subcategory,
      brand,
      isPublished,
      images
    } = body

    // Validación
    if (!name || !description || !urlSlug || !sku || !categoryId || !brand) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    if (!basePrice || basePrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'El precio base debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar slug único
    const existingSlug = await prisma.product.findUnique({
      where: { urlSlug }
    })

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'El URL slug ya está en uso' },
        { status: 400 }
      )
    }

    // Verificar SKU único
    const existingSku = await prisma.product.findUnique({
      where: { sku }
    })

    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'El SKU ya está en uso' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        urlSlug,
        sku,
        basePrice: typeof basePrice === "string" ? parseInt(basePrice) : basePrice,
        salePrice: salePrice ? (typeof salePrice === "string" ? parseInt(salePrice) : salePrice) : null,
        stock: stock ? (typeof stock === "string" ? parseInt(stock) : stock) : 0,
        categoryId,
        subcategory: subcategory || null,
        brand,
        isPublished: isPublished !== undefined ? isPublished : false,
        images: images || []
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
