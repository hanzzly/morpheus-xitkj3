import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// GET /api/galeri — publik
export async function GET() {
  const items = await prisma.galeriItem.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

// POST /api/galeri — hanya admin, upload gambar baru ke galeri
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const judul = formData.get("judul")?.toString();
    const deskripsi = formData.get("deskripsi")?.toString();
    const file = formData.get("gambar") as File | null;

    if (!judul) {
      return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Gambar wajib diunggah" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/galeri");

    const item = await prisma.galeriItem.create({
      data: {
        judul,
        deskripsi,
        gambarUrl: uploaded.url,
        cloudinaryId: uploaded.publicId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create galeri error:", error);
    return NextResponse.json({ error: "Gagal mengunggah gambar" }, { status: 500 });
  }
}
