import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${url.protocol}//${url.host}`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=google_auth_failed`);
  }

  if (!code || !state) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const session = await getSession();

  // Validate state to prevent CSRF
  if (state !== session.oauthState) {
    return new NextResponse("State mismatch (CSRF)", { status: 400 });
  }

  // Clear state
  session.oauthState = undefined;
  await session.save();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return new NextResponse("Google OAuth credentials are not configured", { status: 500 });
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google token error:", tokenData);
      return NextResponse.redirect(`${baseUrl}/?error=google_token_error`);
    }

    // 2. Fetch user profile (email)
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok || !profileData.email) {
      console.error("Google profile error:", profileData);
      return NextResponse.redirect(`${baseUrl}/?error=google_profile_error`);
    }

    const email = profileData.email;

    // 3. Find Anggota by email
    const anggota = await prisma.anggota.findUnique({
      where: { email },
    });

    if (!anggota) {
      // Email not registered
      return NextResponse.redirect(`${baseUrl}/?error=email_not_registered`);
    }

    // 4. Create Session
    session.isLoggedIn = true;
    session.role = "anggota";
    session.anggotaId = anggota.id;
    session.email = anggota.email || undefined;
    await session.save();

    return NextResponse.redirect(`${baseUrl}/member`);

  } catch (err) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect(`${baseUrl}/?error=server_error`);
  }
}
