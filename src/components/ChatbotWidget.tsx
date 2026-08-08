"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// ─── Suggested questions saat chatbot pertama dibuka ─────────────────────────

const SUGGESTED_QUESTIONS = [
  "Siapa ketua kelas XI TKJ 3?",
  "Jadwal piket hari Senin?",
  "Apa saja prestasi kelas?",
  "Siapa anggota kelas?",
];

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hanya render di client — cegah hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fokus input saat chat dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      if (!hasGreeted) {
        setHasGreeted(true);
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content:
              "Halo! Saya asisten virtual kelas XI TKJ 3 — Cyber Security. Silakan tanyakan apa saja tentang kelas kami, anggota, jadwal piket, atau prestasi kelas! 🔐",
          },
        ]);
      }
    }
  }, [isOpen, hasGreeted]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setIsLoading(true);

      // Tambah placeholder pesan AI
      const aiId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: "assistant", content: "" },
      ]);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error" }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    content:
                      err.error ??
                      "Maaf, terjadi kesalahan. Coba lagi nanti.",
                  }
                : m
            )
          );
          return;
        }

        // Baca SSE stream
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data) as { content?: string };
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId
                      ? { ...m, content: m.content + parsed.content }
                      : m
                  )
                );
              }
            } catch {
              // skip malformed
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  content: "Koneksi terputus. Silakan coba lagi.",
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [messages, isLoading]
  );

  // Early return SETELAH semua hook — tidak melanggar Rules of Hooks
  if (!mounted) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    setIsOpen(false);
  }

  const showSuggestions =
    messages.length <= 1 && !isLoading;

  return (
    <>
      {/* ─── Floating Chat Window ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-50 flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col"
            style={{
              height: "min(520px, calc(100dvh - 120px))",
              borderRadius: "16px",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "#0d0d0d",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              {/* Bot avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#c8ff00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BotIcon />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#c8ff00",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Asisten Kelas
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.45)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  XI TKJ 3 · Cyber Security
                </p>
              </div>

              {/* Status dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "block",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />
                <button
                  onClick={handleClose}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    color: "rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 6,
                    transition: "color 0.15s",
                  }}
                  aria-label="Tutup chatbot"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                  }
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isLoading &&
                messages[messages.length - 1]?.content === "" && (
                  <TypingIndicator />
                )}

              {/* Suggested questions */}
              {showSuggestions && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: 100,
                        padding: "5px 12px",
                        fontSize: "11px",
                        color: "#374151",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "var(--font-body)",
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#0d0d0d";
                        e.currentTarget.style.color = "#c8ff00";
                        e.currentTarget.style.borderColor = "#0d0d0d";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#374151";
                        e.currentTarget.style.borderColor =
                          "rgba(0,0,0,0.12)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              style={{
                flexShrink: 0,
                padding: "10px 12px",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "#fafafa",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan sesuatu…"
                disabled={isLoading}
                style={{
                  flex: 1,
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  background: "#ffffff",
                  color: "#0d0d0d",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#0d0d0d")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")
                }
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: input.trim() ? "#0d0d0d" : "#e5e7eb",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                aria-label="Kirim pesan"
              >
                <SendIcon
                  color={input.trim() ? "#c8ff00" : "#9ca3af"}
                />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Toggle Button ─── */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        id="chatbot-toggle"
        aria-label={isOpen ? "Tutup asisten kelas" : "Buka asisten kelas"}
        style={{
          position: "fixed",
          bottom: "1.25rem",
          right: "1.25rem",
          zIndex: 51,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#0d0d0d",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CloseIcon size={20} color="#ffffff" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <BotIcon size={24} color="#c8ff00" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Notif badge saat chatbot belum dibuka */}
        {!isOpen && !hasGreeted && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid white",
              boxShadow: "0 0 6px #22c55e",
            }}
          />
        )}
      </motion.button>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 6,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#0d0d0d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginBottom: 2,
          }}
        >
          <BotIcon size={13} color="#c8ff00" />
        </div>
      )}
      <div
        style={{
          maxWidth: "78%",
          padding: "9px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "#0d0d0d" : "#f3f4f6",
          color: isUser ? "#c8ff00" : "#111827",
          fontSize: "13px",
          lineHeight: 1.55,
          fontFamily: "var(--font-body)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content || (
          <span style={{ opacity: 0.4, fontStyle: "italic" }}>
            Mengetik...
          </span>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <BotIcon size={13} color="#c8ff00" />
      </div>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "14px 14px 14px 4px",
          background: "#f3f4f6",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#9ca3af",
              display: "block",
              animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
          40% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Micro Icons ──────────────────────────────────────────────────────────────

function BotIcon({
  size = 18,
  color = "#0d0d0d",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function CloseIcon({
  size = 16,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon({ color = "#c8ff00" }: { color?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
