// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get("categorySlug")

    // ids=id1&ids=id2&ids=id3 ...
    const ids = searchParams.getAll("ids")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 32

    let where: any = { isPublished: true }

    // Si vienen IDs, se prioriza ese filtro
    if (ids.length > 0) {
      where.id = { in: ids }
    } else if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      })

      if (!category) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
        })
      }

      where.categoryId = category.id
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      take: ids.length > 0 ? ids.length : limit,
    })

    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Error en web /api/products:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener productos" },
      { status: 500 },
    )
  }
}
