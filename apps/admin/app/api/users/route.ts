import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    // status: "active" (podrías derivarlo de soft delete si implementas)
    const result = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "admin" ? "admin" : "client",
      avatarUrl: user.avatarUrl || "",
      registrationDate: user.createdAt ? user.createdAt.toISOString() : "",
      status: "active"
    }));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
