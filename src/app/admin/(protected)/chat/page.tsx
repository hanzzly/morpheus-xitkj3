"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { Trash2Icon, BanIcon, ShieldCheckIcon, SearchIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react";

interface AdminChatMessage {
  id: string;
  content: string;
  anonName: string;
  ip: string;
  ipHash: string;
  createdAt: string;
}

interface BlockedIpItem {
  id: string;
  ip: string;
  alasan: string | null;
  createdAt: string;
}

export default function AdminChatPage() {
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pesan" | "blokir">("pesan");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal / Form Blokir Manual
  const [manualIp, setManualIp] = useState("");
  const [manualAlasan, setManualAlasan] = useState("");
  const [deletePrevMessages, setDeletePrevMessages] = useState(true);
  const [submittingBlock, setSubmittingBlock] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/anon-chat/admin");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
        setBlockedIps(data.blockedIps ?? []);
      }
    } catch (err) {
      console.error("Gagal memuat data chat admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isIpBlocked = useCallback(
    (ip: string) => blockedIps.some((b) => b.ip === ip),
    [blockedIps]
  );

  async function handleDeleteMessage(id: string) {
    if (!confirm("Hapus pesan ini dari wall chat anonim?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/anon-chat/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert("Gagal menghapus pesan.");
      }
    } catch (err) {
      console.error("Error deleting chat message:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBlockIp(ip: string, deleteMessages = true) {
    if (ip === "unknown") {
      alert("IP tidak valid untuk diblokir.");
      return;
    }

    const alasan = prompt(
      `Masukkan alasan blokir untuk IP ${ip}:`,
      "Spam / Pesan tidak pantas"
    );
    if (alasan === null) return; // cancel

    setBlockingIp(ip);
    try {
      const res = await fetch("/api/anon-chat/block-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, alasan, deleteMessages }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const data = await res.json();
        alert(data.error ?? "Gagal memblokir IP.");
      }
    } catch (err) {
      console.error("Error blocking IP:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setBlockingIp(null);
    }
  }

  async function handleUnblockIp(ip: string) {
    if (!confirm(`Buka blokir untuk IP ${ip}? Pengguna dengan IP ini akan dapat mengirim pesan lagi.`)) return;

    setBlockingIp(ip);
    try {
      const res = await fetch(`/api/anon-chat/block-ip?ip=${encodeURIComponent(ip)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBlockedIps((prev) => prev.filter((b) => b.ip !== ip));
      } else {
        alert("Gagal membuka blokir IP.");
      }
    } catch (err) {
      console.error("Error unblocking IP:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setBlockingIp(null);
    }
  }

  async function handleManualBlockSubmit(e: FormEvent) {
    e.preventDefault();
    setBlockError(null);
    setBlockSuccess(null);

    const trimmedIp = manualIp.trim();
    if (!trimmedIp) {
      setBlockError("IP Address wajib diisi.");
      return;
    }

    setSubmittingBlock(true);
    try {
      const res = await fetch("/api/anon-chat/block-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: trimmedIp,
          alasan: manualAlasan.trim() || "Melanggar aturan",
          deleteMessages: deletePrevMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBlockError(data.error ?? "Gagal memblokir IP.");
        return;
      }

      setBlockSuccess(`IP ${trimmedIp} berhasil diblokir.`);
      setManualIp("");
      setManualAlasan("");
      await loadData();
    } catch {
      setBlockError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmittingBlock(false);
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const term = searchTerm.toLowerCase();
    return (
      msg.content.toLowerCase().includes(term) ||
      msg.anonName.toLowerCase().includes(term) ||
      msg.ip.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs tracking-wide text-accent-2">
            MODERASI & KEAMANAN
          </span>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Moderasi Chat Anonim
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kelola pesan anonim, pantau alamat IP pengirim, dan blokir IP pelaku spam / pesan tidak pantas.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[rgba(66,72,212,0.14)] bg-surface px-4 py-2 text-xs font-semibold text-ink transition-all hover:bg-[rgba(66,72,212,0.06)] disabled:opacity-50"
        >
          <RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-border">
        <button
          onClick={() => setActiveTab("pesan")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-body text-sm font-bold transition-all ${
            activeTab === "pesan"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          💬 Daftar Pesan ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab("blokir")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-body text-sm font-bold transition-all ${
            activeTab === "blokir"
              ? "border-accent-3 text-accent-3"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <ShieldAlertIcon className="h-4 w-4" />
          IP Terblokir ({blockedIps.length})
        </button>
      </div>

      {/* TAB 1: DAFTAR PESAN */}
      {activeTab === "pesan" && (
        <div className="mt-6">
          {/* Search bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari nama, isi pesan, atau IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input !pl-10"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            <span className="font-mono text-xs text-muted">
              Menampilkan {filteredMessages.length} dari {messages.length} pesan
            </span>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted">
                Memuat daftar pesan dan data IP...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">
                {searchTerm
                  ? "Tidak ada pesan yang cocok dengan kata kunci pencarian."
                  : "Belum ada pesan anonim yang masuk."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-[rgba(66,72,212,0.04)] text-xs font-semibold text-muted">
                    <tr>
                      <th className="px-5 py-3.5">Pengirim</th>
                      <th className="px-5 py-3.5">IP Address</th>
                      <th className="px-5 py-3.5">Isi Pesan</th>
                      <th className="px-5 py-3.5">Waktu</th>
                      <th className="px-5 py-3.5 text-right">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMessages.map((msg) => {
                      const blocked = isIpBlocked(msg.ip);
                      return (
                        <tr
                          key={msg.id}
                          className={`transition-colors hover:bg-[rgba(66,72,212,0.02)] ${
                            blocked ? "bg-[rgba(236,72,153,0.03)]" : ""
                          }`}
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-accent">
                            {msg.anonName}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-base px-2.5 py-1 font-mono text-xs font-semibold text-ink">
                                {msg.ip || "unknown"}
                              </span>
                              {blocked && (
                                <span className="flex items-center gap-1 rounded-md bg-[rgba(236,72,153,0.12)] px-2 py-0.5 font-mono text-[10px] font-bold text-accent-3">
                                  <BanIcon className="h-3 w-3" /> BLOCKED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="max-w-md px-5 py-4 font-body text-ink break-words">
                            {msg.content}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                            {new Date(msg.createdAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {blocked ? (
                                <button
                                  onClick={() => handleUnblockIp(msg.ip)}
                                  disabled={blockingIp === msg.ip}
                                  className="inline-flex items-center gap-1 rounded-lg border border-signal/30 bg-signal/10 px-2.5 py-1.5 text-xs font-semibold text-signal transition-colors hover:bg-signal hover:text-white disabled:opacity-50"
                                  title="Buka blokir IP ini"
                                >
                                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                                  Buka Blokir
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockIp(msg.ip)}
                                  disabled={blockingIp === msg.ip || msg.ip === "unknown"}
                                  className="inline-flex items-center gap-1 rounded-lg border border-accent-3/30 bg-accent-3/10 px-2.5 py-1.5 text-xs font-semibold text-accent-3 transition-colors hover:bg-accent-3 hover:text-white disabled:opacity-50"
                                  title="Blokir IP pengirim ini"
                                >
                                  <BanIcon className="h-3.5 w-3.5" />
                                  Blokir IP
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                disabled={deletingId === msg.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                                title="Hapus pesan ini"
                              >
                                <Trash2Icon className="h-3.5 w-3.5" />
                                {deletingId === msg.id ? "..." : "Hapus"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAFTAR IP TERBLOKIR */}
      {activeTab === "blokir" && (
        <div className="mt-6 space-y-6">
          {/* Form Blokir Manual */}
          <div className="rounded-xl border border-border bg-surface p-5 max-w-xl">
            <h2 className="font-display text-sm font-semibold text-ink flex items-center gap-2">
              <BanIcon className="h-4 w-4 text-accent-3" />
              Blokir Alamat IP Manual
            </h2>
            <p className="mt-1 text-xs text-muted">
              IP yang diblokir tidak akan bisa mengirim pesan ke wall chat anonim (status 403 Forbidden).
            </p>

            <form onSubmit={handleManualBlockSubmit} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Alamat IP</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 180.252.12.90"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  className="input"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Alasan Pemblokiran</span>
                <input
                  type="text"
                  placeholder="Contoh: Spam kata kasar / melanggar etika"
                  value={manualAlasan}
                  onChange={(e) => setManualAlasan(e.target.value)}
                  className="input"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={deletePrevMessages}
                  onChange={(e) => setDeletePrevMessages(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-xs text-muted">
                  Sekaligus hapus seluruh riwayat pesan dari IP ini
                </span>
              </label>

              {blockError && (
                <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {blockError}
                </p>
              )}
              {blockSuccess && (
                <p className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-500">
                  {blockSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingBlock}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent-3 px-4 py-2 text-xs font-bold text-white hover:bg-accent-3/90 disabled:opacity-60"
              >
                <BanIcon className="h-3.5 w-3.5" />
                {submittingBlock ? "Memproses..." : "Tambahkan ke Daftar Blokir"}
              </button>
            </form>
          </div>

          {/* Tabel Daftar IP Terblokir */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-[rgba(66,72,212,0.04)] px-5 py-3.5">
              <h3 className="font-display text-sm font-semibold text-ink">
                Daftar IP yang Sedang Diblokir ({blockedIps.length})
              </h3>
            </div>

            {blockedIps.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">
                Belum ada alamat IP yang diblokir.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-[rgba(66,72,212,0.02)] text-xs font-semibold text-muted">
                    <tr>
                      <th className="px-5 py-3.5">Alamat IP</th>
                      <th className="px-5 py-3.5">Alasan</th>
                      <th className="px-5 py-3.5">Tanggal Diblokir</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {blockedIps.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-[rgba(66,72,212,0.02)]">
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-accent-3">
                          {item.ip}
                        </td>
                        <td className="px-5 py-4 font-body text-xs text-ink">
                          {item.alasan || "-"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                          {new Date(item.createdAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            onClick={() => handleUnblockIp(item.ip)}
                            disabled={blockingIp === item.ip}
                            className="inline-flex items-center gap-1 rounded-lg border border-signal/30 bg-signal/10 px-3 py-1.5 text-xs font-semibold text-signal transition-colors hover:bg-signal hover:text-white disabled:opacity-50"
                          >
                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                            {blockingIp === item.ip ? "Memproses..." : "Buka Blokir"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
