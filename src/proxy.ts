import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman login sendiri tidak boleh diproteksi, kalau tidak orang tidak akan pernah bisa login
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/member")) {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );

    if (!session.isLoggedIn) {
      // Redirect based on the path
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      } else {
        return NextResponse.redirect(new URL("/?error=login_required", request.url));
      }
    }

    if (pathname.startsWith("/member") && session.role !== "anggota") {
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
    }

    if (pathname.startsWith("/admin") && session.role === "anggota") {
      return NextResponse.redirect(new URL("/member", request.url));
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
