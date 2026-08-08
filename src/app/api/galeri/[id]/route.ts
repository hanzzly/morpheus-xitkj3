import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";

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
