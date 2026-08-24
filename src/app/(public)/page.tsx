import { prisma } from "@/lib/prisma";
import { FadeInSection } from "@/components/FadeInSection";
import { GaleriCarousel } from "@/components/GaleriCarousel";
import { StrukturSection } from "@/components/StrukturSection";
import { JadwalPiketSection } from "@/components/JadwalPiketSection";
import { PrestasiSection } from "@/components/PrestasiSection";
import { HeroSection } from "@/components/HeroSection";
import { ScrollBackground } from "@/components/ScrollBackground";
import AnonChatSection from "@/components/AnonChatSection";

export const dynamic = "force-dynamic";

async function getData() {
  const [anggota, galeri, jadwal, prestasi] = await Promise.all([
    prisma.anggota.findMany({ orderBy: [{ urutan: "asc" }, { createdAt: "asc" }] }),
    prisma.galeriItem.findMany({ orderBy: [{ urutan: "asc" }, { createdAt: "desc" }], take: 12 }),
    prisma.jadwalPiket.findMany({ include: { anggota: true }, orderBy: { hari: "asc" } }),
    prisma.prestasi.findMany({ orderBy: [{ urutan: "asc" }, { createdAt: "desc" }] }),
  ]);
  return { anggota, galeri, jadwal, prestasi };
}

interface GaleriData {
  id: string;
  judul: string;
  deskripsi: string | null;
  gambarUrl: string;
}

export default async function HomePage() {
  const { anggota, galeri, jadwal, prestasi } = await getData();

  const totalAnggota = anggota.length;
  const totalGaleri = galeri.length;
  const totalJadwal = jadwal.length;

  return (
    <ScrollBackground>
      {/* ============ HERO ============ */}
      <HeroSection 
        totalAnggota={totalAnggota} 
        totalGaleri={totalGaleri} 
        totalJadwal={totalJadwal} 
      />

      {/* ============ GALERI ============ */}
      <FadeInSection id="galeri" className="relative py-24">
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <span className="section-label">Dokumentasi</span>
          <h2
            className="nexus-headline mt-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Galeri Kegiatan
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-muted">
            Momen kegiatan bersama dan aktivitas kelas XI TKJ 3 Morpheus.
          </p>
        </div>

        {galeri.length === 0 ? (
          <div className="relative mx-auto mt-10 max-w-md rounded-2xl border-2 border-dashed border-[rgba(66,72,212,0.2)] py-16 text-center text-muted font-body">
            Belum ada foto yang diunggah.
          </div>
        ) : (
          <div className="relative mt-8">
            <GaleriCarousel
              images={galeri.map((g: GaleriData) => ({ src: g.gambarUrl, judul: g.judul, deskripsi: g.deskripsi }))}
            />
          </div>
        )}
      </FadeInSection>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="h-0.5 rounded-full bg-[rgba(66,72,212,0.1)]" />
      </div>

      {/* ============ PRESTASI ============ */}
      <FadeInSection id="prestasi" className="relative overflow-hidden py-24">
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <span className="section-label">Penghargaan</span>
            <h2
              className="nexus-headline mt-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Prestasi Kelas
            </h2>
            <p className="mx-auto mt-3 max-w-xl font-body text-sm text-muted">
              Berbagai pencapaian dan penghargaan yang diraih oleh anggota kelas XI TKJ 3.
            </p>
          </div>

          <PrestasiSection prestasi={prestasi} />
        </div>
      </FadeInSection>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="h-0.5 rounded-full bg-[rgba(66,72,212,0.1)]" />
      </div>

      {/* ============ STRUKTUR KELAS ============ */}
      <FadeInSection id="struktur" className="relative py-24">
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <span className="section-label">Organisasi</span>
          <h2
            className="nexus-headline mt-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Struktur Kelas
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-muted">
            Susunan pengurus dan penanggung jawab kelas XI TKJ 3 Morpheus.
          </p>

          <StrukturSection anggota={anggota} />
        </div>
      </FadeInSection>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="h-0.5 rounded-full bg-[rgba(66,72,212,0.1)]" />
      </div>

      {/* ============ JADWAL PIKET ============ */}
      <FadeInSection id="jadwal-piket" className="relative py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <span className="section-label">Operasional</span>
            <h2
              className="nexus-headline mt-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Jadwal Piket
            </h2>
            <p className="mx-auto mt-3 max-w-xl font-body text-sm text-muted">
              Pembagian tugas piket kebersihan kelas setiap hari.
            </p>
          </div>

          <div className="mt-10">
            <JadwalPiketSection jadwal={jadwal} />
          </div>
        </div>
      </FadeInSection>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="h-0.5 rounded-full bg-[rgba(66,72,212,0.1)]" />
      </div>

      {/* ============ TEXT ANONIM ============ */}
      <AnonChatSection />
    </ScrollBackground>
  );
}

