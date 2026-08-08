import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  username?: string;
  role?: "admin" | "anggota";
  anggotaId?: string;
  email?: string;
  oauthState?: string; // Untuk proteksi CSRF OAuth
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string, // wajib diisi di .env, minimal 32 karakter
  cookieName: "kelas-cyber-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 jam
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (session.isLoggedIn === undefined) {
    session.isLoggedIn = false;
  }

  return session;
}
