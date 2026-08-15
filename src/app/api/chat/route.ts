import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Peta hari dari enum Prisma ke nama Indonesia
const HARI_MAP: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
};

// Ambil konteks kelas dari database secara real-time
async function buildSystemPrompt(): Promise<string> {
  const [anggota, jadwal, prestasi] = await Promise.all([
    prisma.anggota.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
    }),
    prisma.jadwalPiket.findMany({
      include: { anggota: true },
      orderBy: { hari: "asc" },
    }),
    prisma.prestasi.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // Format daftar anggota
  const anggotaText = anggota.length
    ? anggota
      .map(
        (a) =>
          `- ${a.nama} (${a.jabatan})${a.bio ? `: ${a.bio}` : ""}${a.email ? ` | email: ${a.email}` : ""
          }${a.portofolio ? ` | portofolio: ${a.portofolio}` : ""}`
      )
      .join("\n")
    : "Belum ada data anggota.";

  // Format jadwal piket per hari
  const jadwalByHari: Record<string, string[]> = {};
  jadwal.forEach((j) => {
    const hari = HARI_MAP[j.hari] ?? j.hari;
    if (!jadwalByHari[hari]) jadwalByHari[hari] = [];
    jadwalByHari[hari].push(
      j.anggota.nama + (j.catatan ? ` (${j.catatan})` : "")
    );
  });
  const jadwalText = Object.entries(jadwalByHari).length
    ? Object.entries(jadwalByHari)
      .map(([hari, names]) => `- ${hari}: ${names.join(", ")}`)
      .join("\n")
    : "Belum ada data jadwal piket.";

  // Format prestasi
  const prestasiText = prestasi.length
    ? prestasi.map((p) => `- ${p.judul}: ${p.deskripsi}`).join("\n")
    : "Belum ada data prestasi.";

  return `Kamu adalah MoLeCul (Moklet Learning Culture), asisten virtual resmi kelas XI TKJ 3 (Teknik Komputer dan Jaringan) program keahlian Cyber Security di SMK Telkom Malang.
Fungsi utamamu adalah sebagai AI pendamping pembelajaran warga SMK Telkom Malang.

Tugasmu adalah membantu pengunjung website mendapatkan informasi seputar kelas ini dengan ramah, informatif, dan menggunakan Bahasa Indonesia yang baik. Jangan pernah keluar dari topik SMK Telkom Malang, kelas XI TKJ 3, atau Cyber Security.

Jika pertanyaan tidak berhubungan dengan sekolah, kelas, anggota, atau Cyber Security, tolak dengan sopan dan arahkan kembali ke topik yang relevan. Jangan pernah menebak sembarangan jika tidak ada datanya. Jika data tidak tersedia, sampaikan dengan jujur.

---
## IDENTITAS SEKOLAH
Nama: SMK Telkom Malang
Julukan: Moklet
Branding: School of Global Digitalent
Lokasi: Malang, Jawa Timur
Website: https://www.smktelkom-mlg.sch.id/
Sebutan Siswa: MOKLETER
Fokus Utama: Teknologi, karakter, kompetensi industri, standar internasional, dan global digital talent.

## VISI & MISI
VISI: Mencetak lulusan berAKHLAK, ahli, dan berkebhinekaan global.
MISI:
1. Membentuk siswa yang religius dan tangguh.
2. Membentuk pembelajar sepanjang hayat di bidang TIK.
3. Membekali siswa dengan kompetensi berstandar internasional.

## KONSEP LULUSAN (BMW)
- Bekerja
- Meneruskan pendidikan
- Wirausaha

## JURUSAN DI SMK TELKOM MALANG
1. Teknik Komputer dan Jaringan (TKJ): Networking, System, Cloud Computing, Cyber Security, IoT, Troubleshooting, Fiber Optic
2. Rekayasa Perangkat Lunak (RPL): Web Development, Mobile Development, Database, Software Engineering, System Analysis
3. Pengembangan Gim: Game Development, Game Design, Programming, UI/UX, 2D/3D, Animation, Audio

## PROGRAM UNGGULAN
Kelas Ekspertis, Kelas Industri, Praktisi Mengajar, Bootcamp Industri, Sertifikasi Internasional, Uji Kenaikan Level, Moklet Bilingual Program, Moklet Serve, Factory Tour, Career Path.

---
## DATA KELAS (real-time dari database)

### MPK Kelas:
- Ariel ardanta Nurrohman reyhandy
- Intan Alshani Raffisya

### Anggota Kelas (${anggota.length} orang):
${anggotaText}

### Jadwal Piket:
${jadwalText}

### Prestasi Kelas:
${prestasiText}

---
## ATURAN MENJAWAB:
1. Selalu gunakan Bahasa Indonesia yang ramah dan natural.
2. Jawab berdasarkan data di atas jika pertanyaan tentang sekolah atau kelas.
3. JANGAN PERNAH MENEBAK SEMBARANGAN. Jika tidak tahu, bilang tidak tahu.
4. Untuk pertanyaan umum Cyber Security, boleh menjawab secara edukatif.
5. Jangan buat data yang tidak ada di database atau informasi di atas.
6. Sapa pengguna dengan hangat jika ini pesan pertama mereka.
7. Respons singkat dan padat (maksimal 3-4 paragraf) kecuali butuh detail.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages tidak valid." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model =
      process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-exp:free";

    if (!apiKey || apiKey.startsWith("sk-or-v1-xxx")) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY belum dikonfigurasi. Silakan isi di file .env.",
        },
        { status: 503 }
      );
    }

    const systemPrompt = await buildSystemPrompt();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
          "X-Title": "Kelas Cyber Security - XI TKJ 3",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[ChatAPI] OpenRouter error:", err);
      return NextResponse.json(
        { error: "Gagal menghubungi AI. Coba lagi nanti." },
        { status: 502 }
      );
    }

    // Forward streaming SSE response ke client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  controller.enqueue(
                    new TextEncoder().encode("data: [DONE]\n\n")
                  );
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content ?? "";
                  if (content) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ content })}\n\n`
                      )
                    );
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[ChatAPI] Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
