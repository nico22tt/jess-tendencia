import { NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function GET() {
  try {
    const unreadCount = await prisma.notification.count({
      where: { isRead: false }
    })
    return NextResponse.json({ unread: unreadCount })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json(
      { error: "Error al obtener el contador" }, { status: 500 }
    )
  }
}
