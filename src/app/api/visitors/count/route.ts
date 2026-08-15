import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.visitor.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting visitors:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
