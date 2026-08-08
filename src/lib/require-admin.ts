import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Dipakai di awal setiap API route yang butuh login admin.
 * Kembalikan null kalau lolos (boleh lanjut), atau NextResponse 401 kalau ditolak.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json(
      { error: "Kamu harus login sebagai admin untuk melakukan ini" },
      { status: 401 }
    );
  }
  return null;
}
