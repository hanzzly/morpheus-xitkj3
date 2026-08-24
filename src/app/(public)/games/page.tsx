"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Data & Helpers ───────────────────────────────────────────────────────────

const WORD_POOL = [
  "CIPHER", "HACKER", "FIREWALL", "MORPHEUS", "NETWORK", "CRYPTO",
  "BINARY", "ROUTER", "SERVER", "PACKET", "KERNEL", "SOCKET",
  "PROXY", "BOTNET", "PHISHING", "EXPLOIT", "PAYLOAD", "ROOTKIT",
  "MALWARE", "SANDBOX", "ENCRYPT", "DECRYPT", "PROTOCOL", "CONSOLE",
  "TERMINAL", "TROJAN", "RANSOMWARE", "BACKDOOR", "SPOOFING", "PENTEST",
  "STEALTH", "BYPASS", "FORENSIC", "DARKWEB", "HONEYPOT",
];

function caesarEncrypt(text: string, shift: number): string {
  return text
    .split("")
    .map((ch) => {
      if (/[A-Z]/.test(ch)) {
        return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
      }
      return ch;
    })
    .join("");
}

function generateOptions(correct: string, all: string[]): string[] {
  const pool = all.filter((w) => w !== correct);
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffled, correct].sort(() => Math.random() - 0.5);
}

// difficulty bands: Easy (shift 1-8), Medium (9-16), Hard (17-24)
function difficultyLabel(shift: number): { label: string; color: string } {
  if (shift <= 8) return { label: "Easy", color: "#10B981" };
  if (shift <= 16) return { label: "Medium", color: "#F59E0B" };
  return { label: "Hard", color: "#EC4899" };
}

interface Question {
  plainText: string;
  shift: number;
  cipherText: string;
  options: string[];
}

function generateQuestion(score: number): Question {
  // Difficulty scales with score
  let maxShift = 8;
  if (score >= 5) maxShift = 16;
  if (score >= 10) maxShift = 24;
  const shift = Math.floor(Math.random() * maxShift) + 1;

  const plainText = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  const cipherText = caesarEncrypt(plainText, shift);
  const options = generateOptions(plainText, WORD_POOL);

  return { plainText, shift, cipherText, options };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const [phase, setPhase] = useState<"idle" | "playing" | "answered">("idle");
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const nextQuestion = useCallback((currentScore: number) => {
    setQuestion(generateQuestion(currentScore));
    setSelected(null);
    setPhase("playing");
    setShowHint(false);
    setTimeLeft(30);
    setTimerActive(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || phase !== "playing") return;
    if (timeLeft <= 0) {
      // Time's up → wrong
      setTimerActive(false);
      setSelected("__timeout__");
      setStreak(0);
      setTotalAnswered((t) => t + 1);
      setPhase("answered");
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, phase]);

  function handleAnswer(option: string) {
    if (phase !== "playing" || !question) return;
    setTimerActive(false);
    setSelected(option);
    setTotalAnswered((t) => t + 1);
    setPhase("answered");

    if (option === question.plainText) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      // Bonus score: +2 for streak ≥ 3, +1 base
      const bonus = newStreak >= 3 ? 2 : 1;
      setScore((s) => s + bonus);
    } else {
      setStreak(0);
    }
  }

  function handleStart() {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAnswered(0);
    nextQuestion(0);
  }

  const accuracy = totalAnswered > 0
    ? Math.round((score / totalAnswered) * 100) // simplified; accounts for bonuses differently
    : 0;

  const diff = question ? difficultyLabel(question.shift) : null;

  // ── Render: Idle ──
  if (phase === "idle") {
    return (
      <main className="min-h-screen bg-base py-24">
        <div className="mx-auto max-w-2xl px-5">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="section-label">🎮 Mini Games</span>
            <h1
              className="nexus-headline mt-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Caesar Cipher
            </h1>
            <p className="mx-auto mt-4 max-w-md font-body text-sm text-muted">
              Tebak plaintext dari kata yang dienkripsi dengan Caesar Cipher.
              Kesulitan meningkat seiring skor kamu!
            </p>
          </div>

          {/* Info cards */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: "🟢", label: "Easy", desc: "Shift 1–8", color: "#10B981" },
              { icon: "🟡", label: "Medium", desc: "Shift 9–16", color: "#F59E0B" },
              { icon: "🔴", label: "Hard", desc: "Shift 17–24", color: "#EC4899" },
            ].map((d) => (
              <div
                key={d.label}
                className="solid-card flex flex-col items-center gap-2 p-5 text-center"
              >
                <span className="text-2xl">{d.icon}</span>
                <span
                  className="font-headline text-base font-bold"
                  style={{ color: d.color }}
                >
                  {d.label}
                </span>
                <span className="font-mono text-xs text-muted">{d.desc}</span>
              </div>
            ))}
          </div>

          {/* Caesar explanation */}
          <div className="glass-card mb-10 p-6">
            <h2 className="mb-3 font-headline text-base font-bold uppercase text-ink">
              Apa itu Caesar Cipher?
            </h2>
            <p className="font-body text-sm text-muted leading-relaxed">
              Caesar Cipher menggeser setiap huruf alfabet sebanyak{" "}
              <code className="rounded bg-[rgba(66,72,212,0.08)] px-1.5 py-0.5 font-mono text-xs text-accent">
                shift
              </code>{" "}
              posisi. Contoh: dengan shift 3,{" "}
              <code className="rounded bg-[rgba(66,72,212,0.08)] px-1.5 py-0.5 font-mono text-xs text-accent">
                A → D
              </code>
              ,{" "}
              <code className="rounded bg-[rgba(66,72,212,0.08)] px-1.5 py-0.5 font-mono text-xs text-accent">
                Z → C
              </code>
              .
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl bg-[rgba(66,72,212,0.04)] p-4 font-mono text-xs">
              <div className="text-muted">Plain:&nbsp;&nbsp;</div>
              <div className="text-accent font-bold">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div>
              <div className="mt-1 text-muted">Cipher (shift 3):</div>
              <div className="text-accent-3 font-bold">D E F G H I J K L M N O P Q R S T U V W X Y Z A B C</div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              id="games-start-btn"
              onClick={handleStart}
              className="btn-primary px-10 py-3 text-base"
            >
              🚀 Mulai Permainan
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Render: Playing / Answered ──
  return (
    <main className="min-h-screen bg-base py-24">
      <div className="mx-auto max-w-2xl px-5">
        {/* Top bar: score + streak */}
        <div className="mb-8 flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-[rgba(66,72,212,0.14)] px-3 py-1.5 font-body text-xs font-semibold text-muted transition-colors hover:text-accent"
          >
            ← Beranda
          </a>
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Score */}
            <div className="glass-card flex items-center gap-2 px-4 py-2">
              <span className="font-mono text-xs text-muted">SKOR</span>
              <span className="font-headline text-lg font-bold text-ink">{score}</span>
            </div>
            {/* Streak */}
            <div
              className="glass-card flex items-center gap-2 px-4 py-2 transition-all"
              style={streak >= 3 ? { borderColor: "#EC4899", boxShadow: "0 0 12px rgba(236,72,153,0.25)" } : {}}
            >
              <span className="font-mono text-xs text-muted">STREAK</span>
              <span
                className="font-headline text-lg font-bold"
                style={{ color: streak >= 3 ? "#EC4899" : "var(--color-ink)" }}
              >
                {streak >= 3 ? `🔥${streak}` : streak}
              </span>
            </div>
          </div>
        </div>

        {/* Question card */}
        {question && (
          <div
            className="solid-card overflow-hidden"
            style={{ boxShadow: "6px 6px 0px rgba(66,72,212,0.25)" }}
          >
            {/* Card header: difficulty + timer */}
            <div className="flex items-center justify-between border-b border-[rgba(66,72,212,0.1)] bg-[rgba(66,72,212,0.04)] px-6 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 font-mono text-xs font-bold"
                  style={{ background: diff!.color + "20", color: diff!.color }}
                >
                  {diff!.label}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  Shift: {question.shift}
                </span>
              </div>
              {/* Timer bar */}
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-[rgba(66,72,212,0.1)]">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(timeLeft / 30) * 100}%`,
                      background: timeLeft > 10 ? "#10B981" : timeLeft > 5 ? "#F59E0B" : "#EC4899",
                    }}
                  />
                </div>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: timeLeft <= 5 ? "#EC4899" : "var(--color-muted)" }}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Cipher text display */}
            <div className="px-6 py-8 text-center">
              <p className="mb-2 font-mono text-[10px] tracking-widest text-muted uppercase">
                Teks terenkripsi:
              </p>
              <div
                className="inline-block rounded-2xl px-8 py-4 font-mono text-3xl font-bold tracking-[0.25em] text-accent"
                style={{
                  background: "rgba(66,72,212,0.06)",
                  border: "1.5px solid rgba(66,72,212,0.15)",
                  letterSpacing: "0.25em",
                }}
              >
                {question.cipherText}
              </div>
              <p className="mt-3 font-body text-xs text-muted">
                Pilih kata asli yang tepat:
              </p>

              {/* Hint button */}
              {phase === "playing" && (
                <button
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  className="mt-2 rounded-full border border-[rgba(66,72,212,0.14)] px-3 py-1 font-body text-xs text-muted transition-colors hover:text-accent disabled:opacity-40"
                >
                  {showHint ? `💡 Huruf pertama: ${question.plainText[0]}` : "💡 Tampilkan petunjuk"}
                </button>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 px-6 pb-6">
              {question.options.map((opt) => {
                const isCorrect = opt === question.plainText;
                const isSelected = opt === selected;
                const isTimeout = selected === "__timeout__";

                let style: React.CSSProperties = {};
                let extraClass = "hover:border-accent hover:bg-[rgba(66,72,212,0.06)]";

                if (phase === "answered") {
                  if (isCorrect) {
                    style = { background: "rgba(16,185,129,0.12)", borderColor: "#10B981", color: "#10B981" };
                    extraClass = "";
                  } else if (isSelected && !isCorrect) {
                    style = { background: "rgba(236,72,153,0.12)", borderColor: "#EC4899", color: "#EC4899" };
                    extraClass = "";
                  }
                }

                return (
                  <button
                    key={opt}
                    id={`games-option-${opt}`}
                    onClick={() => handleAnswer(opt)}
                    disabled={phase === "answered"}
                    className={`rounded-xl border border-[rgba(66,72,212,0.14)] bg-white px-4 py-3.5 font-mono text-base font-bold tracking-widest text-ink transition-all disabled:cursor-default ${extraClass}`}
                    style={style}
                  >
                    {isCorrect && phase === "answered" && "✓ "}
                    {isSelected && !isCorrect && "✗ "}
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Timeout feedback */}
            {selected === "__timeout__" && (
              <div className="mx-6 mb-4 rounded-xl bg-[rgba(236,72,153,0.08)] px-4 py-3 text-center font-body text-sm font-semibold text-accent-3">
                ⏱️ Waktu habis! Jawaban: <span className="font-mono text-ink">{question.plainText}</span>
              </div>
            )}

            {/* Feedback + next button */}
            {phase === "answered" && (
              <div className="border-t border-[rgba(66,72,212,0.1)] px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    {selected !== "__timeout__" && selected === question.plainText ? (
                      <div>
                        <p className="font-body text-sm font-bold text-signal">
                          ✨ Benar!
                          {streak >= 3 && (
                            <span className="ml-2 text-accent-3">🔥 Streak {streak}× (+2 poin)</span>
                          )}
                        </p>
                        <p className="font-body text-xs text-muted">
                          {question.cipherText} = {question.plainText} (shift {question.shift})
                        </p>
                      </div>
                    ) : selected !== "__timeout__" ? (
                      <div>
                        <p className="font-body text-sm font-bold text-accent-3">
                          ✗ Salah. Jawaban: <span className="font-mono text-ink">{question.plainText}</span>
                        </p>
                        <p className="font-body text-xs text-muted">
                          Streak kamu kembali ke 0.
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <button
                    id="games-next-btn"
                    onClick={() => nextQuestion(score)}
                    className="btn-primary shrink-0"
                  >
                    Soal Berikutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Soal", value: totalAnswered },
            { label: "Best Streak", value: bestStreak >= 3 ? `🔥${bestStreak}` : bestStreak },
            { label: "Skor", value: score },
          ].map((s) => (
            <div key={s.label} className="glass-card py-3 text-center">
              <div className="font-headline text-xl font-bold text-ink">{s.value}</div>
              <div className="font-mono text-[9px] tracking-wider text-muted uppercase">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quit/restart button */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            id="games-quit-btn"
            onClick={() => setPhase("idle")}
            className="rounded-full border border-[rgba(66,72,212,0.14)] px-6 py-2.5 font-body text-sm font-semibold text-muted transition-all hover:border-accent-3 hover:text-accent-3"
          >
            🏳️ Keluar
          </button>
          <button
            id="games-restart-btn"
            onClick={handleStart}
            className="rounded-full border border-[rgba(66,72,212,0.14)] px-6 py-2.5 font-body text-sm font-semibold text-muted transition-all hover:border-accent hover:text-accent"
          >
            🔄 Mulai Ulang
          </button>
        </div>
      </div>
    </main>
  );
}
