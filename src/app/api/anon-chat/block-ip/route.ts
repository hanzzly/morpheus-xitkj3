import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

// GET /api/anon-chat/block-ip — ambil daftar IP yang diblokir (hanya admin)
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const list = await prisma.blockedIp.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ blockedIps: list });
  } catch (error) {
    console.error("GET /api/anon-chat/block-ip error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar IP diblokir" }, { status: 500 });
  }
}

// POST /api/anon-chat/block-ip — blokir IP baru
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const ip: string = (body?.ip ?? "").trim();
    const alasan: string = (body?.alasan ?? "Melanggar aturan wall chat").trim();
    const deleteMessages: boolean = body?.deleteMessages === true;

    if (!ip || ip === "unknown") {
      return NextResponse.json({ error: "IP address tidak valid" }, { status: 400 });
    }

    const blocked = await prisma.blockedIp.upsert({
      where: { ip },
      update: { alasan },
      create: { ip, alasan },
    });

    // Opsional: hapus semua pesan dari IP tersebut jika diminta
    if (deleteMessages) {
      await prisma.chatMessage.deleteMany({
        where: { ip },
      });
    }

    return NextResponse.json({ success: true, blocked });
  } catch (error) {
    console.error("POST /api/anon-chat/block-ip error:", error);
    return NextResponse.json({ error: "Gagal memblokir IP" }, { status: 500 });
  }
}

// DELETE /api/anon-chat/block-ip — buka blokir IP
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const ip = url.searchParams.get("ip");

    if (!ip) {
      return NextResponse.json({ error: "Parameter IP wajib disertakan" }, { status: 400 });
    }

    await prisma.blockedIp.deleteMany({
      where: { ip },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/anon-chat/block-ip error:", error);
    return NextResponse.json({ error: "Gagal membuka blokir IP" }, { status: 500 });
  }
}
