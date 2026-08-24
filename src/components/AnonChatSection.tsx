"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatMessage {
  id: string;
  content: string;
  anonName: string;
  createdAt: string;
}

/** Format waktu relatif singkat (e.g. "baru saja", "2m lalu", "1j lalu") */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "baru saja";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m lalu`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}j lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function AnonChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // detik tersisa
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/anon-chat", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      // silent fail saat polling
    }
  }, []);

  // Mount: ambil pesan & mulai polling 5 detik
  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMessages]);

  // Auto-scroll ke bawah HANYA di dalam container chat (tanpa scroll halaman browser)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Countdown cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending || cooldown > 0) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/anon-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setCooldown(data.remainSec ?? 15);
        setError(`Tunggu ${data.remainSec ?? 15} detik sebelum kirim lagi.`);
      } else if (!res.ok) {
        setError(data.error ?? "Gagal mengirim pesan.");
      } else {
        setInput("");
        await fetchMessages();
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="anon-chat" className="relative py-24">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #EC4899, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #4248D4, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-5">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="section-label">Komunitas</span>
          <h2
            className="nexus-headline mt-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Text Anonim
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-sm text-muted">
            Kirim pesan anonim ke wall kelas. Identitasmu tersembunyi — hanya
            kode unik yang tampil.
          </p>
        </div>

        {/* Chat box */}
        <div
          className="solid-card overflow-hidden"
          style={{ boxShadow: "6px 6px 0px rgba(66,72,212,0.25)" }}
        >
          {/* Header bar */}
          <div className="flex items-center gap-3 border-b border-[rgba(66,72,212,0.1)] bg-[rgba(66,72,212,0.04)] px-5 py-3">
            <span className="flex h-2 w-2 rounded-full bg-signal pulse-dot" />
            <span className="font-mono text-xs font-bold tracking-wider text-muted uppercase">
              Live Wall · Polling 5s
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted">
              {messages.length}/100 pesan
            </span>
          </div>

          {/* Messages area */}
          <div
            ref={chatContainerRef}
            className="flex h-80 flex-col gap-3 overflow-y-auto p-5"
            role="log"
            aria-live="polite"
            aria-label="Daftar pesan anonim"
          >
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <span className="text-3xl">💬</span>
                <p className="font-body text-sm text-muted">
                  Belum ada pesan. Jadilah yang pertama!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  {/* Avatar circle */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      background: `hsl(${(parseInt(msg.anonName.replace("Anonim#", "")) * 137) % 360}, 65%, 55%)`,
                    }}
                    aria-hidden
                  >
                    {msg.anonName.slice(-2)}
                  </div>
                  {/* Bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="font-body text-xs font-bold text-accent">
                        {msg.anonName}
                      </span>
                      <span className="font-mono text-[9px] text-muted">
                        {relativeTime(msg.createdAt)}
                      </span>
                    </div>
                    <div className="rounded-xl rounded-tl-sm bg-[rgba(66,72,212,0.06)] px-4 py-2.5 font-body text-sm text-ink break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-[rgba(66,72,212,0.1)] px-5 py-4">
            {error && (
              <p
                role="alert"
                className="mb-3 rounded-xl bg-[rgba(236,72,153,0.08)] px-3 py-2 font-body text-xs font-semibold text-accent-3"
              >
                ⚠️ {error}
              </p>
            )}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-3"
              aria-label="Form kirim pesan anonim"
            >
              <div className="relative flex-1">
                <input
                  id="anon-chat-input"
                  type="text"
                  className="input pr-16"
                  placeholder="Tulis pesanmu di sini…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={280}
                  disabled={sending || cooldown > 0}
                  autoComplete="off"
                  aria-label="Pesan anonim"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-muted">
                  {input.length}/280
                </span>
              </div>
              <button
                id="anon-chat-send"
                type="submit"
                disabled={sending || cooldown > 0 || !input.trim()}
                className="btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                aria-label={cooldown > 0 ? `Tunggu ${cooldown}s` : "Kirim pesan"}
              >
                {cooldown > 0 ? (
                  <span className="font-mono text-xs">{cooldown}s</span>
                ) : sending ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Kirim…
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                    Kirim
                  </>
                )}
              </button>
            </form>
            <p className="mt-2 font-body text-[10px] text-muted">
              💡 Identitasmu otomatis disembunyikan. Pesanmu tampil sebagai kode
              unik berdasarkan IP-mu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
