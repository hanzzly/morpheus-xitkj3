"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  gambarUrl: string;
}

export default function AdminGaleriPage() {
  const [list, setList] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambarFile, setGambarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/galeri");
    setList(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- memuat data awal saat komponen mount
    void loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!gambarFile) {
      setError("Pilih gambar terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("judul", judul);
      fd.append("deskripsi", deskripsi);
      fd.append("gambar", gambarFile);

      const res = await fetch("/api/galeri", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengunggah gambar");
        return;
      }

      setJudul("");
      setDeskripsi("");
      setGambarFile(null);
      const fileInput = document.getElementById("gambar-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await loadData();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto ini dari galeri?")) return;
    await fetch(`/api/galeri/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="p-6 sm:p-8">
      <span className="font-mono text-xs tracking-wide text-accent-2">
        KELOLA
      </span>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
        Galeri Kegiatan
      </h1>
      <p className="mt-1 text-sm text-muted">
        Unggah foto dokumentasi kegiatan kelas yang akan tampil di halaman
        galeri publik.
      </p>

      {/* FORM UPLOAD */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg rounded-lg border border-border bg-surface p-5"
      >
        <h2 className="font-display text-sm font-semibold text-ink">
          Unggah Foto Baru
        </h2>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Judul</span>
            <input
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="input"
              placeholder="Contoh: Praktik Konfigurasi Firewall"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Deskripsi (opsional)
            </span>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
              className="input resize-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Gambar</span>
            <input
              id="gambar-input"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setGambarFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent"
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
          disabled={submitting}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
        >
          {submitting ? "Mengunggah..." : "Unggah Foto"}
        </button>
      </form>

      {/* LIST */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold text-ink">
          Foto Tersimpan ({list.length})
        </h2>

        {loading ? (
          <p className="mt-3 text-sm text-muted">Memuat data...</p>
        ) : list.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada foto.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border border-border bg-surface"
              >
                <div className="relative aspect-square w-full bg-base">
                  <Image
                    src={item.gambarUrl}
                    alt={item.judul}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-ink">
                    {item.judul}
                  </p>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-1.5 text-xs font-medium text-red-400 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
