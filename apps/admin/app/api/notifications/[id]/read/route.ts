import { NextRequest, NextResponse } from "next/server"
import prisma from "@jess/shared/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { success: false, error: "Error al marcar notificación" },
      { status: 500 }
    )
  }
}
