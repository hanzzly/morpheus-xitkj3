import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * ==========================================================================
 * ROUTE SEMENTARA — HANYA UNTUK SETUP AWAL.
 * HAPUS FILE INI (folder src/app/api/setup-admin) SETELAH DIPAKAI SEKALI.
 * ==========================================================================
 *
 * Dipakai untuk membuat akun admin pertama lewat browser, tanpa perlu
 * menjalankan `npm run create-admin` dari lokal (berguna kalau koneksi
 * lokal ke database diblokir jaringan, misalnya port 5432 kena blokir ISP).
 *
 * Cara pakai:
 * 1. Set environment variable SETUP_SECRET di Vercel (string acak bebas).
 * 2. Deploy.
 * 3. Buka di browser:
 *    https://domain-kamu.vercel.app/api/setup-admin?secret=ISI_SETUP_SECRET&username=USERNAME&password=PASSWORD
 * 4. Kalau berhasil, HAPUS route ini dan deploy ulang.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const username = searchParams.get("username");
  const password = searchParams.get("password");

  if (!process.env.SETUP_SECRET) {
    return NextResponse.json(
      { error: "SETUP_SECRET belum diset di environment variable Vercel" },
      { status: 500 }
    );
  }

  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Secret salah" }, { status: 401 });
  }

  if (!username || !password) {
    return NextResponse.json(
      { error: "Wajib isi ?username=...&password=... di URL" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    await prisma.admin.update({
      where: { username },
      data: { password: hashed },
    });
    return NextResponse.json({
      success: true,
      message: `Password untuk admin "${username}" berhasil diperbarui. SEKARANG HAPUS ROUTE INI.`,
    });
  }

  await prisma.admin.create({ data: { username, password: hashed } });
  return NextResponse.json({
    success: true,
    message: `Admin "${username}" berhasil dibuat. SEKARANG HAPUS ROUTE INI.`,
  });
}
