import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

// ============================================================================
// KONFIGURASI CHAT ANONIM
// ============================================================================
export const RATE_LIMIT_MS = 5_000; // Jeda antar pesan: 15 detik (15000 ms)
export const MAX_CONTENT_LENGTH = 280; // Maksimal karakter per pesan
export const MAX_CHAT_HISTORY = 100; // Jumlah pesan terbaru yang ditampilkan ke publik

/** Hash IP → 8-char hex string for anonName + rate limiting */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip + "morpheus-salt").digest("hex").slice(0, 8);
}

/** Generate "Anonim#XXXX" from IP hash (4-digit decimal 0000 - 9999) */
function anonName(ipHash: string): string {
  const num = parseInt(ipHash.slice(0, 4), 16) % 10000;
  return `Anonim#${num.toString().padStart(4, "0")}`;
}

/** Ambil IP pengirim dari berbagai header proxy / cloud hosting */
function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

// GET /api/anon-chat — ambil 100 pesan terbaru untuk publik
export async function GET() {
  try {
    // Ambil 100 pesan TERBARU (desc), lalu reverse agar urutan tampil dari terlama -> terbaru
    const latestMessages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: MAX_CHAT_HISTORY,
      select: {
        id: true,
        content: true,
        anonName: true,
        createdAt: true,
      },
    });

    const messages = latestMessages.reverse();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/anon-chat error:", error);
    return NextResponse.json({ error: "Gagal mengambil pesan" }, { status: 500 });
  }
}

// POST /api/anon-chat — kirim pesan baru
export async function POST(request: NextRequest) {
  try {
    const rawIp = getClientIp(request);

    // 1. Cek apakah IP diblokir oleh admin
    if (rawIp !== "unknown") {
      const isBlocked = await prisma.blockedIp.findUnique({
        where: { ip: rawIp },
      });

      if (isBlocked) {
        return NextResponse.json(
          {
            error: isBlocked.alasan
              ? `IP kamu telah diblokir (${isBlocked.alasan}).`
              : "IP kamu telah diblokir dari wall chat anonim.",
          },
          { status: 403 }
        );
      }
    }

    const ipHash = hashIp(rawIp);

    // 2. Rate limiting: cek pesan terakhir dari IP ini dalam RATE_LIMIT_MS
    const cooldownAgo = new Date(Date.now() - RATE_LIMIT_MS);
    const recent = await prisma.chatMessage.findFirst({
      where: {
        ipHash,
        createdAt: { gte: cooldownAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      const remainMs = recent.createdAt.getTime() + RATE_LIMIT_MS - Date.now();
      const remainSec = Math.max(1, Math.ceil(remainMs / 1000));
      return NextResponse.json(
        {
          error: "Rate limit",
          remainSec,
          message: `Tunggu ${remainSec} detik sebelum mengirim pesan berikutnya.`,
        },
        { status: 429 }
      );
    }

    // 3. Validasi isi pesan
    const body = await request.json();
    const content: string = (body?.content ?? "").trim();

    if (!content) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Pesan terlalu panjang (maks ${MAX_CONTENT_LENGTH} karakter)` },
        { status: 400 }
      );
    }

    // 4. Simpan pesan baru
    const message = await prisma.chatMessage.create({
      data: {
        content,
        anonName: anonName(ipHash),
        ip: rawIp,
        ipHash,
      },
      select: {
        id: true,
        content: true,
        anonName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/anon-chat error:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
