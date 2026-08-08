import { NextResponse } from "next/server";

/**
 * Hidden endpoint — bagian dari CTF challenge website XI TKJ 3.
 * GET /api/flag → mengembalikan Part 3 dari flag.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "🏁 Congrats, you found the last piece!",
      hint: "Now combine all 3 parts you have collected.",
      part: "[ PART 3/3 ] :: h4ppY_N1C3_D4Y}",
      from: "XI TKJ 3 — Cyber Security, SMK Telkom Malang",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
