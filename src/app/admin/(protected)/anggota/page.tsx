"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { JABATAN_LIST, getJabatanLabel } from "@/lib/jabatan";

interface Anggota {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
  bio: string | null;
  email: string | null;
  urutan: number;
}

const emptyForm = { nama: "", jabatan: "anggota", bio: "", email: "", urutan: "0" };

export default function AdminAnggotaPage() {
  const [list, setList] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/anggota");
    const data = await res.json();
    setList(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- memuat data awal saat komponen mount
    void loadData();
  }, []);

  function startEdit(a: Anggota) {
    setEditingId(a.id);
    setForm({
      nama: a.nama,
      jabatan: a.jabatan,
      bio: a.bio ?? "",
      email: a.email ?? "",
      urutan: String(a.urutan),
    });
    setFotoFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFotoFile(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("nama", form.nama);
      fd.append("jabatan", form.jabatan);
      fd.append("bio", form.bio);
      fd.append("email", form.email);
      fd.append("urutan", form.urutan);
      if (fotoFile) fd.append("foto", fotoFile);

      const url = editingId ? `/api/anggota/${editingId}` : "/api/anggota";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan data");
        return;
      }

      cancelEdit();
      await loadData();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus anggota ini? Tindakan tidak bisa dibatalkan.")) return;
    await fetch(`/api/anggota/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="p-6 sm:p-8">
      <span className="font-mono text-xs tracking-wide text-accent-2">
        KELOLA
      </span>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
        Anggota Kelas
      </h1>
      <p className="mt-1 text-sm text-muted">
        Tambah, ubah, atau hapus data anggota kelas beserta foto profilnya.
      </p>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg rounded-lg border border-border bg-surface p-5"
      >
        <h2 className="font-display text-sm font-semibold text-ink">
          {editingId ? "Edit Anggota" : "Tambah Anggota Baru"}
        </h2>

        <div className="mt-4 space-y-3">
          <Field label="Nama">
            <input
              required
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="Jabatan">
            <select
              required
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              className="input"
            >
              {JABATAN_LIST.map((j) => (
                <option key={j.key} value={j.key}>
                  {j.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bio singkat (opsional)">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </Field>

          <Field label="Email Siswa (Opsional, untuk Login Google)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="contoh@smktelkom-mlg.sch.id"
            />
          </Field>

          <Field label="Urutan tampil (angka kecil tampil duluan)">
            <input
              type="number"
              value={form.urutan}
              onChange={(e) => setForm({ ...form, urutan: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="Foto profil (opsional)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent"
            />
          </Field>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Anggota"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-base"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold text-ink">
          Daftar Anggota ({list.length})
        </h2>

        {loading ? (
          <p className="mt-3 text-sm text-muted">Memuat data...</p>
        ) : list.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada anggota.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-base ring-1 ring-border">
                  {a.fotoUrl ? (
                    <Image src={a.fotoUrl} alt={a.nama} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
                      {a.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{a.nama}</p>
                  <p className="truncate text-xs text-muted">{getJabatanLabel(a.jabatan)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => startEdit(a)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
