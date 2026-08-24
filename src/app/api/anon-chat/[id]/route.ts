import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

// DELETE /api/anon-chat/[id] — hapus pesan (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    await prisma.chatMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/anon-chat/[id] error:", error);
    return NextResponse.json({ error: "Pesan tidak ditemukan atau gagal dihapus" }, { status: 404 });
  }
}
