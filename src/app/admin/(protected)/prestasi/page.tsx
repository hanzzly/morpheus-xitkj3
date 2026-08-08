"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { PencilIcon, XIcon } from "lucide-react";

interface PrestasiItem {
  id: string;
  judul: string;
  deskripsi: string;
  gambarUrl: string;
  urutan: number;
}

export default function AdminPrestasiPage() {
  const [list, setList] = useState<PrestasiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form tambah
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urutan, setUrutan] = useState("0");
  const [gambarFile, setGambarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal edit
  const [editItem, setEditItem] = useState<PrestasiItem | null>(null);
  const [editJudul, setEditJudul] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editUrutan, setEditUrutan] = useState("0");
  const [editGambarFile, setEditGambarFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/prestasi");
    setList(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!gambarFile) { setError("Pilih gambar terlebih dahulu"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("judul", judul);
      fd.append("deskripsi", deskripsi);
      fd.append("urutan", urutan);
      fd.append("gambar", gambarFile);
      const res = await fetch("/api/prestasi", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menyimpan"); return; }
      setJudul(""); setDeskripsi(""); setUrutan("0"); setGambarFile(null);
      const fi = document.getElementById("gambar-input") as HTMLInputElement | null;
      if (fi) fi.value = "";
      await loadData();
    } catch { setError("Tidak bisa terhubung ke server."); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus prestasi ini?")) return;
    await fetch(`/api/prestasi/${id}`, { method: "DELETE" });
    await loadData();
  }

  function openEdit(item: PrestasiItem) {
    setEditItem(item);
    setEditJudul(item.judul);
    setEditDeskripsi(item.deskripsi);
    setEditUrutan(String(item.urutan));
    setEditGambarFile(null);
    setEditError(null);
  }

  function closeEdit() {
    setEditItem(null);
    setEditError(null);
    const fi = document.getElementById("edit-gambar-input") as HTMLInputElement | null;
    if (fi) fi.value = "";
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("judul", editJudul);
      fd.append("deskripsi", editDeskripsi);
      fd.append("urutan", editUrutan);
      if (editGambarFile) fd.append("gambar", editGambarFile);
      const res = await fetch(`/api/prestasi/${editItem.id}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error ?? "Gagal memperbarui"); return; }
      closeEdit();
      await loadData();
    } catch { setEditError("Tidak bisa terhubung ke server."); }
    finally { setEditSubmitting(false); }
  }

  return (
    <div className="p-6 sm:p-8">
      <span className="font-mono text-xs tracking-wide text-accent-2">KELOLA</span>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Prestasi Kelas</h1>
      <p className="mt-1 text-sm text-muted">
        Tambahkan pencapaian kelas yang akan tampil di halaman prestasi publik.
      </p>

      {/* FORM TAMBAH */}
      <form onSubmit={handleSubmit} className="mt-6 max-w-lg rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Tambah Prestasi Baru</h2>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Judul</span>
            <input required value={judul} onChange={(e) => setJudul(e.target.value)} className="input" placeholder="Contoh: Juara 1 LKS Cyber Security" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Deskripsi</span>
            <textarea required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={2} className="input resize-none" placeholder="Ceritakan detail prestasinya..." />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Urutan (opsional)</span>
            <input type="number" value={urutan} onChange={(e) => setUrutan(e.target.value)} className="input" placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Gambar</span>
            <input id="gambar-input" type="file" accept="image/*" required onChange={(e) => setGambarFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent" />
          </label>
        </div>
        {error && <p className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60">
          {submitting ? "Menyimpan..." : "Simpan Prestasi"}
        </button>
      </form>

      {/* LIST */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold text-ink">Prestasi Tersimpan ({list.length})</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Memuat data...</p>
        ) : list.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada prestasi.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="relative aspect-square w-full bg-base">
                  <Image src={item.gambarUrl} alt={item.judul} fill sizes="200px" className="object-cover" />
                  {item.urutan > 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                      #{item.urutan}
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-ink">{item.judul}</p>
                  <div className="mt-1.5 flex gap-3">
                    <button onClick={() => openEdit(item)} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                      <PencilIcon className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs font-medium text-red-400 hover:underline">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL EDIT */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-sm font-semibold text-ink">Edit Prestasi</h2>
              <button onClick={closeEdit} className="rounded-md p-1 text-muted hover:bg-base hover:text-ink">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 p-5">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Judul</span>
                <input required value={editJudul} onChange={(e) => setEditJudul(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Deskripsi</span>
                <textarea required value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} rows={3} className="input resize-none" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Urutan</span>
                <input type="number" value={editUrutan} onChange={(e) => setEditUrutan(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">
                  Ganti Gambar <span className="text-muted/60">(kosongkan jika tidak ingin ganti)</span>
                </span>
                <input id="edit-gambar-input" type="file" accept="image/*" onChange={(e) => setEditGambarFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent" />
              </label>

              {/* Preview gambar saat ini */}
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                <Image src={editItem.gambarUrl} alt={editItem.judul} fill className="object-cover" sizes="96px" />
              </div>

              {editError && <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{editError}</p>}

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={editSubmitting} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60">
                  {editSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button type="button" onClick={closeEdit} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-base hover:text-ink">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
