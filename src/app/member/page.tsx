"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { getJabatanLabel } from "@/lib/jabatan";

interface Anggota {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
  bio: string | null;
  portofolio: string | null;
  email: string | null;
}

export default function MemberDashboard() {
  const [data, setData] = useState<Anggota | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [bio, setBio] = useState("");
  const [portofolio, setPortofolio] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    // Kita bisa ambil semua anggota lalu filter berdasar email dari session, 
    // atau buat endpoint khusus /api/member/me.
    // Karena kita tidak punya endpoint /me, kita bisa buat endpoint kecil atau fetch /api/anggota 
    // Wait, let's just make a /api/member/me route to fetch the exact data.
    const res = await fetch("/api/member/me");
    if (res.ok) {
      const myData = await res.json();
      setData(myData);
      setBio(myData.bio ?? "");
      setPortofolio(myData.portofolio ?? "");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("bio", bio);
      fd.append("portofolio", portofolio);
      if (fotoFile) fd.append("foto", fotoFile);

      const res = await fetch("/api/member/update", { method: "PUT", body: fd });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "Gagal menyimpan data");
        return;
      }

      setSuccess("Profil berhasil diperbarui!");
      setFotoFile(null);
      await loadData();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePhoto() {
    if (!confirm("Hapus foto profil?")) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const fd = new FormData();
      fd.append("hapusFoto", "true");

      const res = await fetch("/api/member/update", { method: "PUT", body: fd });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "Gagal menghapus foto");
        return;
      }

      setSuccess("Foto profil berhasil dihapus!");
      await loadData();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-muted">
        Memuat data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-muted">Data tidak ditemukan.</p>
        <Link href="/" className="mt-4 rounded-md bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base py-12 sm:py-20">
      <div className="mx-auto max-w-xl px-5">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent-2"
        >
          ← Kembali ke beranda
        </Link>

        <div className="glass-card overflow-hidden rounded-xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-base ring-2 ring-border">
              {data.fotoUrl ? (
                <Image src={data.fotoUrl} alt={data.nama} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-muted">
                  {data.nama.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
              {data.nama}
            </h1>
            <span className="mt-2 inline-block rounded-sm bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase text-ink">
              {getJabatanLabel(data.jabatan)}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 border-t border-border/50 pt-8">
            <h2 className="font-display text-lg font-semibold text-ink">Edit Profil</h2>
            
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="block text-sm font-medium text-muted">
                  Foto Profil Baru
                </span>
                {data.fotoUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={submitting}
                    className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-sm file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-semibold file:text-ink hover:file:bg-accent/90 cursor-pointer"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted">
                Bio Singkat
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Ceritakan sedikit tentang dirimu..."
                className="input resize-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted">
                Portofolio (Tautan/Deskripsi)
              </span>
              <textarea
                value={portofolio}
                onChange={(e) => setPortofolio(e.target.value)}
                rows={3}
                placeholder="Tuliskan portofolio atau berikan tautan..."
                className="input resize-none"
              />
            </label>

            {error && (
              <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
