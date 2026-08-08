import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// GET /api/prestasi — publik
export async function GET() {
  const items = await prisma.prestasi.findMany({
    orderBy: [
      { urutan: "asc" },
      { createdAt: "desc" },
    ],
  });
  return NextResponse.json(items);
}

// POST /api/prestasi — hanya admin, upload prestasi baru
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const judul = formData.get("judul")?.toString();
    const deskripsi = formData.get("deskripsi")?.toString();
    const urutanStr = formData.get("urutan")?.toString();
    const file = formData.get("gambar") as File | null;

    if (!judul || !deskripsi) {
      return NextResponse.json({ error: "Judul dan Deskripsi wajib diisi" }, { status: 400 });
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Gambar wajib diunggah" }, { status: 400 });
    }

    const urutan = urutanStr ? parseInt(urutanStr, 10) : 0;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/prestasi");

    const item = await prisma.prestasi.create({
      data: {
        judul,
        deskripsi,
        urutan,
        gambarUrl: uploaded.url,
        cloudinaryId: uploaded.publicId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create prestasi error:", error);
    return NextResponse.json({ error: "Gagal menyimpan prestasi" }, { status: 500 });
  }
}
