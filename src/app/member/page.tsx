"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getJabatanLabel } from "@/lib/jabatan";
import { LogOutIcon, ArrowLeftIcon, CheckCircleIcon, UserIcon } from "lucide-react";

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
  const router = useRouter();
  const [data, setData] = useState<Anggota | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [bio, setBio] = useState("");
  const [portofolio, setPortofolio] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/member/me");
      if (res.ok) {
        const myData = await res.json();
        setData(myData);
        setBio(myData.bio ?? "");
        setPortofolio(myData.portofolio ?? "");
      }
    } catch (err) {
      console.error("Load member data error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleLogout() {
    if (!confirm("Apakah kamu yakin ingin keluar dari akun?")) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.push("/");
    router.refresh();
  }

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
      const fi = document.getElementById("member-foto-input") as HTMLInputElement | null;
      if (fi) fi.value = "";
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="font-body text-sm">Memuat profil anggota...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-sm p-8 text-center">
          <p className="font-body text-base font-semibold text-ink">Sesi Tidak Ditemukan</p>
          <p className="mt-2 font-body text-xs text-muted">
            Kamu belum login atau data anggota tidak terdaftar.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/api/auth/google/login"
              className="btn-primary justify-center text-xs"
            >
              <UserIcon className="h-4 w-4" /> Login Google
            </a>
            <Link
              href="/"
              className="rounded-full border border-border px-4 py-2 font-body text-xs font-semibold text-muted hover:bg-base"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base py-12 sm:py-20">
      <div className="mx-auto max-w-xl px-5">
        {/* Top bar: Back to Home + Logout button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 font-body text-xs font-semibold text-muted shadow-sm transition-all hover:bg-[rgba(66,72,212,0.06)] hover:text-accent"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Beranda
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(236,72,153,0.3)] bg-white px-3.5 py-1.5 font-body text-xs font-semibold text-accent-3 shadow-sm transition-all hover:bg-[rgba(236,72,153,0.08)] disabled:opacity-50"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>

        {/* Profile Card */}
        <div className="solid-card overflow-hidden p-6 sm:p-8" style={{ boxShadow: "6px 6px 0px rgba(66,72,212,0.2)" }}>
          <div className="flex flex-col items-center text-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-base ring-4 ring-accent/20">
              {data.fotoUrl ? (
                <Image src={data.fotoUrl} alt={data.nama} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-headline text-3xl font-bold text-accent">
                  {data.nama.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <h1 className="mt-4 font-headline text-2xl font-bold text-ink">
              {data.nama}
            </h1>
            
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-accent/10 px-3 py-1 font-body text-xs font-bold text-accent">
                {getJabatanLabel(data.jabatan)}
              </span>
              {data.email && (
                <span className="rounded-full bg-base px-3 py-1 font-mono text-[11px] text-muted">
                  {data.email}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base font-bold text-ink">Edit Profil Anggota</h2>
              <span className="font-mono text-[10px] text-signal font-semibold">● Sesi Aktif</span>
            </div>
            
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="block font-body text-xs font-semibold text-muted">
                  Foto Profil Baru
                </span>
                {data.fotoUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={submitting}
                    className="font-body text-xs font-semibold text-accent-3 hover:underline disabled:opacity-50"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
              <input
                id="member-foto-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-accent-2 cursor-pointer"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-body text-xs font-semibold text-muted">
                Bio Singkat
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Ceritakan sedikit tentang keahlian atau minatmu..."
                className="input resize-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-body text-xs font-semibold text-muted">
                Portofolio (Tautan / Deskripsi Proyek)
              </span>
              <textarea
                value={portofolio}
                onChange={(e) => setPortofolio(e.target.value)}
                rows={3}
                placeholder="https://github.com/username atau proyek yang pernah kamu buat..."
                className="input resize-none"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-[rgba(236,72,153,0.08)] px-4 py-2.5 font-body text-xs font-semibold text-accent-3">
                ⚠️ {error}
              </p>
            )}
            {success && (
              <p className="flex items-center gap-2 rounded-xl bg-[rgba(16,185,129,0.08)] px-4 py-2.5 font-body text-xs font-semibold text-signal">
                <CheckCircleIcon className="h-4 w-4 shrink-0" /> {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Menyimpan Perubahan..." : "💾 Simpan Perubahan"}
            </button>
          </form>

          {/* Bottom actions */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6 text-center sm:flex-row sm:justify-between">
            <Link
              href="/"
              className="font-body text-xs font-semibold text-muted hover:text-accent"
            >
              ← Kembali ke Beranda
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="font-body text-xs font-semibold text-accent-3 hover:underline disabled:opacity-50"
            >
              🚪 Keluar dari Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
