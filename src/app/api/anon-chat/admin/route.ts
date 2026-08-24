import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

// GET /api/anon-chat/admin — ambil seluruh data chat termasuk IP & daftar blocked IPs (hanya admin)
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [messages, blockedIps] = await Promise.all([
      prisma.chatMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          content: true,
          anonName: true,
          ip: true,
          ipHash: true,
          createdAt: true,
        },
      }),
      prisma.blockedIp.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ messages, blockedIps });
  } catch (error) {
    console.error("GET /api/anon-chat/admin error:", error);
    return NextResponse.json({ error: "Gagal mengambil data moderasi chat" }, { status: 500 });
  }
}
