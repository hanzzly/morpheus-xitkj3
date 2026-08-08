import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const HARI_VALID = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"] as const;

// GET /api/jadwal-piket — publik
export async function GET() {
  const jadwal = await prisma.jadwalPiket.findMany({
    include: { anggota: true },
    orderBy: { hari: "asc" },
  });
  return NextResponse.json(jadwal);
}

const jadwalSchema = z.object({
  hari: z.enum(HARI_VALID),
  anggotaId: z.string().min(1, "Anggota wajib dipilih"),
  catatan: z.string().optional(),
});

// POST /api/jadwal-piket — hanya admin
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = jadwalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const jadwal = await prisma.jadwalPiket.create({
      data: parsed.data,
      include: { anggota: true },
    });

    return NextResponse.json(jadwal, { status: 201 });
  } catch (error) {
    console.error("Create jadwal error:", error);
    return NextResponse.json({ error: "Gagal menambahkan jadwal" }, { status: 500 });
  }
}
