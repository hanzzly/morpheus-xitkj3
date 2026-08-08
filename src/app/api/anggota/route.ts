import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { z } from "zod";

// GET /api/anggota — publik, siapa saja bisa lihat daftar anggota kelas
export async function GET() {
  const anggota = await prisma.anggota.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(anggota);
}

const anggotaSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  bio: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  urutan: z.coerce.number().optional(),
});

// POST /api/anggota — hanya admin, mendukung multipart/form-data untuk upload foto
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const raw = {
      nama: formData.get("nama")?.toString() ?? "",
      jabatan: formData.get("jabatan")?.toString() ?? "",
      bio: formData.get("bio")?.toString() ?? undefined,
      email: formData.get("email")?.toString() ?? undefined,
      urutan: formData.get("urutan")?.toString() ?? undefined,
    };

    const parsed = anggotaSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    let fotoUrl: string | undefined;
    const file = formData.get("foto") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImageToCloudinary(buffer, "kelas-cyber/anggota");
      fotoUrl = uploaded.url;
    }

    const emailToSave = parsed.data.email?.trim() || null;

    if (emailToSave) {
      // Check for duplicate email
      const existing = await prisma.anggota.findUnique({ where: { email: emailToSave } });
      if (existing) {
        return NextResponse.json({ error: "Email sudah digunakan oleh anggota lain" }, { status: 400 });
      }
    }

    const anggota = await prisma.anggota.create({
      data: {
        nama: parsed.data.nama,
        jabatan: parsed.data.jabatan,
        bio: parsed.data.bio,
        email: emailToSave,
        urutan: parsed.data.urutan ?? 0,
        fotoUrl,
      },
    });

    return NextResponse.json(anggota, { status: 201 });
  } catch (error) {
    console.error("Create anggota error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan anggota" },
      { status: 500 }
    );
  }
}
