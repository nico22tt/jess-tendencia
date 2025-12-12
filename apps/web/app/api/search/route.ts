import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""

  if (!q.trim()) {
    return NextResponse.json([])
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 24,
  })

  return NextResponse.json(products)
}
