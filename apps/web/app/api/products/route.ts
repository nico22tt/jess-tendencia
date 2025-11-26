// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('categorySlug')

    let where: any = { isPublished: true }

    if (categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
      if (category) {
        where.categoryId = category.id
      } else {
        // No existe la categoría
        return NextResponse.json({
          success: true,
          data: [],
          total: 0
        })
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      },
      take: 32
    })

    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}
