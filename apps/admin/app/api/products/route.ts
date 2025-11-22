import prisma from "packages/prisma/prisma-client"

export async function GET() {
  const products = await prisma.product.findMany()
  return Response.json(products)
}

export async function POST(request: Request) {
  const data = await request.json()
  const product = await prisma.product.create({ data })
  return Response.json(product, { status: 201 })
}

export async function PUT(request: Request) {
  const data = await request.json()
  const product = await prisma.product.update({
    where: { id: data.id },
    data,
  })
  return Response.json(product, { status: 200 })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  await prisma.product.delete({ where: { id } })
  return Response.json({ ok: true }, { status: 200 })
}
