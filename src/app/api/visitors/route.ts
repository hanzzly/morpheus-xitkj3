import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { path, referrer } = await request.json();

    // Dapatkan IP address (headers di Vercel/Next.js)
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown IP";
    const userAgent = request.headers.get("user-agent") || "Unknown UA";

    // Deteksi basic OS, Browser, Device dari userAgent (sederhana)
    let os = "Unknown OS";
    if (userAgent.includes("Win")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "MacOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("like Mac")) os = "iOS";

    let browser = "Unknown Browser";
    if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";

    let device = "Desktop";
    if (/Mobi|Android/i.test(userAgent)) {
      device = "Mobile";
    } else if (/Tablet|iPad/i.test(userAgent)) {
      device = "Tablet";
    }

    const visitor = await prisma.visitor.create({
      data: {
        ip,
        userAgent,
        os,
        browser,
        device,
        path: path || "/",
        referrer: referrer || null,
      },
    });

    return NextResponse.json({ success: true, id: visitor.id });
  } catch (error) {
    console.error("Error creating visitor log:", error);
    return NextResponse.json({ success: false, error: "Failed to log visitor" }, { status: 500 });
  }
}

// GET route for Admin Dashboard to fetch visitors list
export async function GET(request: Request) {
  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { visitedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ visitors });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 });
  }
}
