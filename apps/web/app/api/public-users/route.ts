import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// POST /api/public-users
export async function POST(req: NextRequest) {
  const { id, email, name, avatarUrl, role } = await req.json();
  // Prevenir duplicados si refrescan
  const exists = await prisma.user.findUnique({ where: { id } });
  if (exists) return NextResponse.json({ success: true });
  await prisma.user.create({
    data: {
      id,
      email,
      name,
      avatarUrl,
      role: role || "client",
    }
  });
  return NextResponse.json({ success: true });
}
