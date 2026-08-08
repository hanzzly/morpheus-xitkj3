"use client";

import { useEffect, useState, FormEvent } from "react";

interface Anggota {
  id: string;
  nama: string;
}

interface JadwalItem {
  id: string;
  hari: string;
  anggotaId: string;
  anggota: Anggota;
  catatan: string | null;
}

const HARI_OPTIONS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"] as const;
const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
};

export default function AdminJadwalPiketPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [hari, setHari] = useState<string>("SENIN");
  const [anggotaId, setAnggotaId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [jadwalRes, anggotaRes] = await Promise.all([
      fetch("/api/jadwal-piket"),
      fetch("/api/anggota"),
    ]);
    setJadwal(await jadwalRes.json());
    const anggotaData: Anggota[] = await anggotaRes.json();
    setAnggotaList(anggotaData);
    if (anggotaData.length > 0 && !anggotaId) {
      setAnggotaId(anggotaData[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- memuat data awal saat komponen mount
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!anggotaId) {
      setError("Tambahkan anggota kelas terlebih dahulu di halaman Anggota");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/jadwal-piket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hari, anggotaId, catatan: catatan || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal menambahkan jadwal");
        return;
      }

      setCatatan("");
      await loadData();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch(`/api/jadwal-piket/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="p-6 sm:p-8">
      <span className="font-mono text-xs tracking-wide text-accent-2">
        KELOLA
      </span>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
        Jadwal Piket
      </h1>
      <p className="mt-1 text-sm text-muted">
        Atur siapa yang bertugas piket kebersihan pada setiap hari.
      </p>

      {anggotaList.length === 0 && !loading && (
        <p className="mt-4 max-w-lg rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Belum ada data anggota. Tambahkan anggota dulu di halaman{" "}
          <a href="/admin/anggota" className="underline">
            Anggota
          </a>{" "}
          sebelum membuat jadwal.
        </p>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg rounded-lg border border-border bg-surface p-5"
      >
        <h2 className="font-display text-sm font-semibold text-ink">
          Tambah Jadwal
        </h2>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Hari</span>
            <select
              value={hari}
              onChange={(e) => setHari(e.target.value)}
              className="input"
            >
              {HARI_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {HARI_LABEL[h]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Anggota</span>
            <select
              value={anggotaId}
              onChange={(e) => setAnggotaId(e.target.value)}
              className="input"
              disabled={anggotaList.length === 0}
            >
              {anggotaList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Catatan (opsional)
            </span>
            <input
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="input"
              placeholder="Contoh: membawa alat kebersihan"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || anggotaList.length === 0}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : "Tambah ke Jadwal"}
        </button>
      </form>

      {/* LIST PER HARI */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HARI_OPTIONS.map((h) => {
          const items = jadwal.filter((j) => j.hari === h);
          return (
            <div key={h} className="rounded-lg border border-border bg-surface p-4">
              <h3 className="font-display text-sm font-semibold text-ink">
                {HARI_LABEL[h]}
              </h3>
              {loading ? (
                <p className="mt-2 text-xs text-muted">Memuat...</p>
              ) : items.length === 0 ? (
                <p className="mt-2 text-xs text-muted">Belum ada petugas.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {items.map((j) => (
                    <li
                      key={j.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-ink">{j.anggota.nama}</span>
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="text-xs font-medium text-red-400 hover:underline"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
