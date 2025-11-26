import { NextRequest, NextResponse } from "next/server"
import prisma from '@jess/shared/lib/prisma'

// GET: /api/user/addresses?user_id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get("user_id")
    if (!user_id) {
      return NextResponse.json({ success: false, error: "user_id es requerido." }, { status: 400 })
    }
    const addresses = await prisma.user_addresses.findMany({
      where: { user_id },
      orderBy: [{ is_default: "desc" }, { created_at: "asc" }]
    })
    // Puedes transformar objetos aquí si quieres solo ciertos campos
    return NextResponse.json(addresses)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error leyendo direcciones" }, { status: 500 })
  }
}

// POST: /api/user/addresses
// Body: { user_id, alias, recipient_name, phone_number, address_line_1, ... }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const required = ["user_id", "alias", "recipient_name", "phone_number", "address_line_1", "city", "region", "zip_code"]
    for (const key of required) {
      if (!body[key] || (typeof body[key] === "string" && !body[key].trim())) {
        return NextResponse.json({ success: false, error: `Campo requerido: ${key}` }, { status: 400 })
      }
    }
    // Si este será default y existen otras, cambia el default
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
    return NextResponse.json({ success: false, error: err.message || "Error creando dirección" }, { status: 500 })
  }
}

// PUT y DELETE (solo lógica ejemplo, para tener APIs REST completas):

// PUT: /api/user/addresses (actualiza un address existente, por id)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: "id es requerido." }, { status: 400 })
    }
    const update = { ...body }
    delete update.id

    const addr = await prisma.user_addresses.update({
      where: { id: body.id },
      data: update
    })
    return NextResponse.json(addr)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error actualizando dirección" }, { status: 500 })
  }
}

// DELETE: /api/user/addresses (borra por id, espera body {id})
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: "id es requerido." }, { status: 400 })
    }
    await prisma.user_addresses.delete({ where: { id: body.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error eliminando dirección" }, { status: 500 })
  }
}
