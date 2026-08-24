import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary";

// PATCH /api/galeri/[id] — hanya admin, edit data galeri
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const item = await prisma.galeriItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    const formData = await request.formData();
    const judul = formData.get("judul")?.toString();
    const deskripsi = formData.get("deskripsi")?.toString();
    const urutanStr = formData.get("urutan")?.toString();
    const file = formData.get("gambar") as File | null;

    if (!judul) {
      return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
    }

    const urutan = urutanStr !== undefined && urutanStr !== null ? parseInt(urutanStr, 10) || 0 : item.urutan;

    // Jika ada gambar baru, hapus yang lama dari Cloudinary dan upload yang baru
    let gambarUrl = item.gambarUrl;
    let cloudinaryId = item.cloudinaryId;

    if (file && file.size > 0) {
      if (item.cloudinaryId) {
        await deleteImageFromCloudinary(item.cloudinaryId).catch((err) =>
          console.error("Gagal hapus gambar lama di Cloudinary:", err)
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/galeri");
      gambarUrl = uploaded.url;
      cloudinaryId = uploaded.publicId;
    }

    const updated = await prisma.galeriItem.update({
      where: { id },
      data: {
        judul,
        deskripsi: deskripsi ?? null,
        urutan,
        gambarUrl,
        cloudinaryId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update galeri error:", error);
    return NextResponse.json({ error: "Gagal memperbarui item galeri" }, { status: 500 });
  }
}

// DELETE /api/galeri/[id] — hanya admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const item = await prisma.galeriItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    if (item.cloudinaryId) {
      await deleteImageFromCloudinary(item.cloudinaryId).catch((err) =>
        console.error("Gagal hapus gambar di Cloudinary:", err)
      );
    }

    await prisma.galeriItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete galeri error:", error);
    return NextResponse.json({ error: "Gagal menghapus item galeri" }, { status: 500 });
  }
}
