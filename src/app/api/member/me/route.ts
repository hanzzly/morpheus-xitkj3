import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "anggota" || !session.anggotaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const anggota = await prisma.anggota.findUnique({
      where: { id: session.anggotaId },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        fotoUrl: true,
        bio: true,
        portofolio: true,
        email: true,
      },
    });

    if (!anggota) {
      return NextResponse.json({ error: "Data anggota tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(anggota);
  } catch (error) {
    console.error("Fetch member me error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
