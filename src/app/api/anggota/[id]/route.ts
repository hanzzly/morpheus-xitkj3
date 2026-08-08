import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// PUT /api/anggota/[id] — hanya admin, update data anggota (boleh ganti foto)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const formData = await request.formData();
    const nama = formData.get("nama")?.toString();
    const jabatan = formData.get("jabatan")?.toString();
    const bio = formData.get("bio")?.toString();
    const emailRaw = formData.get("email")?.toString();
    const urutanRaw = formData.get("urutan")?.toString();

    const existing = await prisma.anggota.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    const emailToSave = emailRaw?.trim() || null;

    if (emailToSave && emailToSave !== existing.email) {
      // Check for duplicate email
      const emailTaken = await prisma.anggota.findUnique({ where: { email: emailToSave } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email sudah digunakan oleh anggota lain" }, { status: 400 });
      }
    }

    let fotoUrl = existing.fotoUrl;
    const file = formData.get("foto") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/anggota");
      fotoUrl = uploaded.url;
    }

    const updated = await prisma.anggota.update({
      where: { id },
      data: {
        nama: nama ?? existing.nama,
        jabatan: jabatan ?? existing.jabatan,
        bio: bio ?? existing.bio,
        email: emailRaw !== undefined ? emailToSave : existing.email,
        urutan: urutanRaw ? parseInt(urutanRaw, 10) : existing.urutan,
        fotoUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update anggota error:", error);
    return NextResponse.json({ error: "Gagal memperbarui anggota" }, { status: 500 });
  }
}

// DELETE /api/anggota/[id] — hanya admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    await prisma.anggota.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete anggota error:", error);
    return NextResponse.json({ error: "Gagal menghapus anggota" }, { status: 500 });
  }
}
