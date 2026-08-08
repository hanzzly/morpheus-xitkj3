import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const item = await prisma.prestasi.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const formData = await request.formData();
    const judul = formData.get("judul")?.toString();
    const deskripsi = formData.get("deskripsi")?.toString();
    const urutanStr = formData.get("urutan")?.toString();
    const file = formData.get("gambar") as File | null;

    if (!judul || !deskripsi) {
      return NextResponse.json({ error: "Judul dan Deskripsi wajib diisi" }, { status: 400 });
    }

    const urutan = urutanStr ? parseInt(urutanStr, 10) : item.urutan;

    // Jika ada gambar baru, hapus yang lama dan upload yang baru
    let gambarUrl = item.gambarUrl;
    let cloudinaryId = item.cloudinaryId;

    if (file && file.size > 0) {
      if (item.cloudinaryId) {
        await deleteImageFromCloudinary(item.cloudinaryId);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/prestasi");
      gambarUrl = uploaded.url;
      cloudinaryId = uploaded.publicId;
    }

    const updated = await prisma.prestasi.update({
      where: { id },
      data: { judul, deskripsi, urutan, gambarUrl, cloudinaryId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update prestasi error:", error);
    return NextResponse.json({ error: "Gagal memperbarui prestasi" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const item = await prisma.prestasi.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (item.cloudinaryId) {
      await deleteImageFromCloudinary(item.cloudinaryId);
    }

    await prisma.prestasi.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete prestasi error:", error);
    return NextResponse.json({ error: "Gagal menghapus prestasi" }, { status: 500 });
  }
}
