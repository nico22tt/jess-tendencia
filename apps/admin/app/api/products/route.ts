import { NextRequest, NextResponse } from 'next/server'
import prisma from '@jess/shared/lib/prisma'

// GET /api/products - Listar productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const supplierId = searchParams.get('supplierId')

    // ✅ Construir where dinámicamente
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    // ✅ Filtrar por proveedor si se especifica
    if (supplierId) {
      where.product_suppliers = {
        some: {
          supplier_id: supplierId
        }
      }
    }

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
        },
        // ✅ Incluir product_suppliers solo si se filtra por proveedor
        product_suppliers: supplierId ? {
          where: {
            supplier_id: supplierId
          },
          include: {
            suppliers: {
              select: {
                id: true,
                name: true
              }
            }
          }
        } : false
      }
    })

    // ✅ Formatear respuesta
    const formatted = products.map((p) => {
      // @ts-ignore - product_suppliers puede ser array o false
      const supplierInfo = supplierId && Array.isArray(p.product_suppliers) && p.product_suppliers.length > 0 
        ? p.product_suppliers[0] 
        : null

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        urlSlug: p.urlSlug,
        sku: p.sku,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        stock: p.stock,
        categoryId: p.categoryId,
        category: p.category,
        subcategory: p.subcategory,
        brand: p.brand,
        isPublished: p.isPublished,
        images: p.images,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        averageCost: p.average_cost,
        lastCost: p.last_cost,
        // ✅ Info del proveedor si está disponible
        ...(supplierInfo && {
          supplierCost: supplierInfo.unit_cost,
          supplierSku: supplierInfo.supplier_sku || p.sku,
          leadTimeDays: supplierInfo.lead_time_days,
          minimumOrderQty: supplierInfo.minimum_order_qty,
          isPreferredSupplier: supplierInfo.is_preferred
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: {
        total: formatted.length,
        ...(supplierId && {
          supplierId,
          filtered: true
        })
      }
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
