"use client";

import { FadeInSection } from "@/components/FadeInSection";

export function HeroSection({
  totalAnggota,
  totalGaleri,
  totalJadwal,
}: {
  totalAnggota: number;
  totalGaleri: number;
  totalJadwal: number;
}) {
  return (
    <section
      id="beranda"
      className="nexus-grid-bg relative flex min-h-[120vh] flex-col items-center justify-start overflow-hidden px-5 pt-32 text-center"
    >
      {/* Dekorasi geometris — persegi biru */}
      <div
        className="nexus-deco-rect"
        style={{
          width: "clamp(60px, 12vw, 120px)",
          height: "clamp(60px, 12vw, 120px)",
          top: "10%",
          left: "6%",
          animationDelay: "0s",
        }}
      />
      {/* Dekorasi — lingkaran pink */}
      <div
        className="nexus-deco-circle"
        style={{
          width: "clamp(70px, 15vw, 140px)",
          height: "clamp(70px, 15vw, 140px)",
          top: "22%",
          right: "5%",
          animationDelay: "-1s",
        }}
      />
      <div
        className="nexus-deco-circle"
        style={{
          width: "clamp(50px, 9vw, 90px)",
          height: "clamp(50px, 9vw, 90px)",
          bottom: "40%",
          left: "8%",
          animationDelay: "-3.5s",
        }}
      />

      {/* Sparkle stars — ala logo */}
      <svg
        className="sparkle"
        style={{
          top: "14%",
          left: "28%",
          width: 28,
          height: 28,
          animationDelay: "-2s",
        }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5Z" />
      </svg>
      <svg
        className="sparkle"
        style={{
          top: "30%",
          right: "18%",
          width: 20,
          height: 20,
          animationDelay: "-4s",
        }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5Z" />
      </svg>

      {/* Konten hero */}
      <div className="relative z-20 mx-auto flex w-full max-w-2xl flex-col items-center text-center mt-8">
        {/* Badge */}
        <div className="nexus-badge">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-signal flex-shrink-0" />
          Kelas Ekspertise &middot; Cyber Security
        </div>

        {/* Headline raksasa */}
        <h1
          className="hero-headline mt-5 w-full"
          style={{ fontSize: "clamp(4.5rem, 14vw, 9rem)" }}
        >
          XI TKJ 3
        </h1>
        <p
          className="hero-headline mt-1 w-full"
          style={{
            fontSize: "clamp(2rem, 6vw, 4rem)",
            color: "var(--color-accent-3)",
          }}
        >
          MORPHEUS
        </p>

        {/* Sub judul */}
        <p
          className="mt-5 font-body text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--color-ink)", opacity: 0.6 }}
        >
          Together We Learn. Together We Lead.
        </p>

        {/* Stats bar */}
        <FadeInSection
          delay={0.15}
          className="mt-10 flex w-full max-w-sm divide-x divide-[rgba(66,72,212,0.12)] rounded-2xl border border-[rgba(66,72,212,0.15)] bg-white/70 backdrop-blur-md shadow-[4px_4px_0_rgba(66,72,212,0.15)]"
        >
          <StatBlock
            value={totalAnggota}
            label="Anggota"
            gradient="stat-gradient-dark"
          />
          <StatBlock
            value={totalGaleri}
            label="Dokumentasi"
            gradient="stat-gradient-lime"
          />
          <StatBlock
            value={totalJadwal}
            label="Jadwal Aktif"
            gradient="stat-gradient-dark"
          />
        </FadeInSection>
      </div>

      {/* Scroll indicator — absolute bawah */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="scroll-indicator">SCROLL DOWN</div>
      </div>
    </section>
  );
}

function StatBlock({
  value,
  label,
  gradient,
}: {
  value: number;
  label: string;
  gradient: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-5">
      <span className={`font-headline text-3xl font-bold ${gradient}`}>
        {value}
      </span>
      <span className="mt-1 font-body text-[10px] font-semibold tracking-wide text-muted uppercase">
        {label}
      </span>
    </div>
  );
}


