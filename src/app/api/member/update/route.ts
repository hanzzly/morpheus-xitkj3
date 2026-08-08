import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function PUT(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "anggota" || !session.anggotaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { anggotaId } = session;

  try {
    const formData = await request.formData();
    const bio = formData.get("bio")?.toString();
    const portofolio = formData.get("portofolio")?.toString();
    const file = formData.get("foto") as File | null;

    const existing = await prisma.anggota.findUnique({ where: { id: anggotaId } });
    
    if (!existing) {
      return NextResponse.json({ error: "Data anggota tidak ditemukan" }, { status: 404 });
    }

    let fotoUrl = existing.fotoUrl;

    const hapusFoto = formData.get("hapusFoto")?.toString() === "true";

    if (hapusFoto) {
      fotoUrl = null;
    } else if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/anggota");
      fotoUrl = uploaded.url;
    }

    const updated = await prisma.anggota.update({
      where: { id: anggotaId },
      data: {
        bio: bio !== undefined ? bio : existing.bio,
        portofolio: portofolio !== undefined ? portofolio : existing.portofolio,
        fotoUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Member update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
