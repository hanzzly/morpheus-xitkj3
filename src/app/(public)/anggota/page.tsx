import { prisma } from "@/lib/prisma";

import Link from "next/link";
import { AnggotaCard } from "@/components/AnggotaCard";

export const metadata = {
  title: "Anggota Kelas — XI TKJ 3 Morpheus | Cyber Security",
};

export const dynamic = "force-dynamic";

interface AnggotaData {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
  bio: string | null;
  portofolio: string | null;
  urutan: number;
}

async function getAnggota(): Promise<AnggotaData[]> {
  return prisma.anggota.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  });
}

export default async function AnggotaPage() {
  const anggota = await getAnggota();

  return (
    <div className="nexus-grid-bg min-h-screen relative">
      {/* Dekorasi sudut — kotak biru */}
      <div
        className="nexus-deco-rect pointer-events-none"
        style={{ width: 100, height: 100, top: "6%", right: "4%", borderRadius: "20px" }}
      />
      {/* Lingkaran pink */}
      <div
        className="nexus-deco-circle pointer-events-none"
        style={{ width: 80, height: 80, bottom: "8%", left: "3%" }}
      />

      {/* Sparkle dekoratif */}
      <svg
        className="sparkle pointer-events-none"
        style={{ top: "12%", left: "15%", width: 24, height: 24, animationDelay: "-3s" }}
        viewBox="0 0 24 24" fill="currentColor"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5Z" />
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-28">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-body text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white border border-[rgba(66,72,212,0.15)] shadow-[2px_2px_0_rgba(66,72,212,0.15)]"
        >
          ← Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="mb-2 mt-4">
          <span className="section-label">Direktori Anggota</span>
        </div>

        <h1
          className="nexus-headline"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
        >
          Anggota Kelas
        </h1>
        <p className="mt-4 max-w-lg font-body text-sm leading-relaxed text-muted">
          Kenalan dengan seluruh anggota kelas XI TKJ 3 Morpheus Expertise Cyber Security beserta peran
          masing-masing.
        </p>

        {/* Badge count */}
        {anggota.length > 0 && (
          <div className="mt-4">
            <span className="nexus-badge">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-signal flex-shrink-0" />
              {anggota.length} Anggota Terdaftar
            </span>
          </div>
        )}

        {/* Grid anggota */}
        {anggota.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-[rgba(66,72,212,0.2)] py-16 text-center font-body text-muted">
            Data anggota belum ditambahkan.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {anggota.map((a: AnggotaData) => (
              <AnggotaCard
                key={a.id}
                nama={a.nama}
                jabatan={a.jabatan}
                fotoUrl={a.fotoUrl}
                bio={a.bio}
                portofolio={a.portofolio}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
