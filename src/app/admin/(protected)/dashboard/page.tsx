import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminVisitorPanel } from "@/components/AdminVisitorPanel";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalAnggota, totalGaleri, totalJadwal] = await Promise.all([
    prisma.anggota.count(),
    prisma.galeriItem.count(),
    prisma.jadwalPiket.count(),
  ]);
  return { totalAnggota, totalGaleri, totalJadwal };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-6 sm:p-8">
      <span className="font-mono text-xs tracking-wide text-accent-2">
        RINGKASAN
      </span>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted">
        Kelola anggota, galeri, dan jadwal piket kelas dari sini.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashCard
          label="Anggota Kelas"
          value={stats.totalAnggota}
          href="/admin/anggota"
          accentClass="text-accent"
        />
        <DashCard
          label="Item Galeri"
          value={stats.totalGaleri}
          href="/admin/galeri"
          accentClass="text-accent-2"
        />
        <DashCard
          label="Jadwal Piket"
          value={stats.totalJadwal}
          href="/admin/jadwal-piket"
          accentClass="text-signal"
        />
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">
          Langkah cepat
        </h2>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Link
            href="/admin/anggota"
            className="rounded-md bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90"
          >
            + Tambah Anggota
          </Link>
          <Link
            href="/admin/galeri"
            className="rounded-md border border-border bg-base px-4 py-2 text-xs font-medium text-ink hover:bg-border/40"
          >
            + Unggah Foto Galeri
          </Link>
          <Link
            href="/admin/jadwal-piket"
            className="rounded-md border border-border bg-base px-4 py-2 text-xs font-medium text-ink hover:bg-border/40"
          >
            + Atur Jadwal Piket
          </Link>
        </div>
      </div>

      {/* Panel Visitor Logs */}
      <aside className="mt-10">
        <AdminVisitorPanel />
      </aside>
    </div>
  );
}

function DashCard({
  label,
  value,
  href,
  accentClass,
}: {
  label: string;
  value: number;
  href: string;
  accentClass: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-surface px-6 py-6 transition-colors hover:border-accent/40"
    >
      <div className={`font-display text-3xl font-semibold ${accentClass}`}>
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Link>
  );
}
