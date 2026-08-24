import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({
      isLoggedIn: false,
    });
  }

  let nama: string | null = null;
  let fotoUrl: string | null = null;

  if (session.role === "anggota" && session.anggotaId) {
    const anggota = await prisma.anggota.findUnique({
      where: { id: session.anggotaId },
      select: { nama: true, fotoUrl: true },
    });
    nama = anggota?.nama ?? null;
    fotoUrl = anggota?.fotoUrl ?? null;
  }

  return NextResponse.json({
    isLoggedIn: true,
    role: session.role ?? "anggota",
    username: session.username ?? null,
    nama: nama ?? session.username ?? "Anggota",
    fotoUrl: fotoUrl ?? null,
    email: session.email ?? null,
  });
}
