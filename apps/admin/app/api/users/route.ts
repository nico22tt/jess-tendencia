import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// Ejemplo funcional para GET /api/users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }, // camelCase y dentro de la función
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true, // camelCase
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
