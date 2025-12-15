import { NextRequest, NextResponse } from "next/server"
import prisma from '@jess/shared/lib/prisma'

// GET: /api/user/addresses?user_id=... o /api/user/addresses?regions=true o ?communes=true&region_code=rm
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get("user_id")
    const regions = searchParams.get("regions")
    const communes = searchParams.get("communes")
    const region_code = searchParams.get("region_code")

    // 1. Si piden regiones
    if (regions === "true") {
      const regionsList = await prisma.$queryRaw<Array<{ code: string; name: string }>>`
        SELECT code, name FROM public.chile_regions ORDER BY display_order ASC
      `
      return NextResponse.json(regionsList)
    }

    // 2. Si piden comunas de una región
    if (communes === "true" && region_code) {
      const communesList = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM public.chile_communes 
        WHERE region_code = ${region_code} 
        ORDER BY display_order ASC, name ASC
      `
      return NextResponse.json(communesList.map(c => c.name))
    }

    // 3. Si piden direcciones del usuario
    if (!user_id) {
      return NextResponse.json({ success: false, error: "user_id es requerido." }, { status: 400 })
    }
    
    const addresses = await prisma.user_addresses.findMany({
      where: { user_id },
      orderBy: [{ is_default: "desc" }, { created_at: "asc" }]
    })
    
    return NextResponse.json(addresses)
  } catch (err: any) {
    console.error("Error en GET /api/user/addresses:", err)
    return NextResponse.json({ success: false, error: err.message || "Error leyendo datos" }, { status: 500 })
  }
}

// POST: /api/user/addresses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const required = ["user_id", "alias", "recipient_name", "phone_number", "address_line_1", "city", "region", "zip_code"]
    for (const key of required) {
      if (!body[key] || (typeof body[key] === "string" && !body[key].trim())) {
        return NextResponse.json({ success: false, error: `Campo requerido: ${key}` }, { status: 400 })
      }
    }
    
    let isDefault = body.is_default ?? false
    if (isDefault) {
      await prisma.user_addresses.updateMany({
        where: { user_id: body.user_id },
        data: { is_default: false }
      })
    }
    
    const newAddr = await prisma.user_addresses.create({
      data: {
        user_id: body.user_id,
        alias: body.alias,
        recipient_name: body.recipient_name,
        phone_number: body.phone_number,
        address_line_1: body.address_line_1,
        address_line_2: body.address_line_2 || "",
        city: body.city,
        region: body.region,
        zip_code: body.zip_code,
        is_default: isDefault
      }
    })
    return NextResponse.json(newAddr)
  } catch (err: any) {
    console.error("Error en POST /api/user/addresses:", err)
    return NextResponse.json({ success: false, error: err.message || "Error creando dirección" }, { status: 500 })
  }
}

// PUT: /api/user/addresses
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: "id es requerido." }, { status: 400 })
    }
    
    const { id, user_id, ...updateData } = body
    
    // Si se marca como default, quitar default a las demás
    if (updateData.is_default === true) {
      await prisma.user_addresses.updateMany({
        where: { user_id },
        data: { is_default: false }
      })
    }
    
    const addr = await prisma.user_addresses.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json(addr)
  } catch (err: any) {
    console.error("Error en PUT /api/user/addresses:", err)
    return NextResponse.json({ success: false, error: err.message || "Error actualizando dirección" }, { status: 500 })
  }
}

// DELETE: /api/user/addresses
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: "id es requerido." }, { status: 400 })
    }
    await prisma.user_addresses.delete({ where: { id: body.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Error en DELETE /api/user/addresses:", err)
    return NextResponse.json({ success: false, error: err.message || "Error eliminando dirección" }, { status: 500 })
  }
}
