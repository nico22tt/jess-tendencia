import { NextRequest, NextResponse } from "next/server";
import prisma from "@jess/shared/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authUsers = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        deleted_at: true,
        raw_user_meta_data: true,
      },
    });

    let publicUsers: any[] = [];
    try {
      publicUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      });
    } catch {}

    // LOG raw data antes de format/merge
    console.log("==== RAW authUsers ====");
    console.dir(authUsers, { depth: null });
    console.log("==== RAW publicUsers ====");
    console.dir(publicUsers, { depth: null });

    const getName = (meta: any) => {
      try {
        if (!meta) return "";
        if (typeof meta === "string") meta = JSON.parse(meta);
        return meta?.name || meta?.full_name || "";
      } catch {
        return "";
      }
    };

    const merged = authUsers.map(auth => {
      const pub = publicUsers.find(u => u.email === auth.email);
      return {
        id: auth.id,
        email: auth.email || pub?.email || "",
        name: getName(auth.raw_user_meta_data) || pub?.name || "",
        role: pub?.role || auth.role || "client",    // <--- ¡nuevo orden!
        avatarUrl: pub?.avatarUrl || "",
        registrationDate: auth.created_at || pub?.createdAt,
        status: !auth.deleted_at ? "active" : "inactive",
      };
    });
    // LOG merged data que va al frontend

    return NextResponse.json({
      success: true,
      data: merged,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
