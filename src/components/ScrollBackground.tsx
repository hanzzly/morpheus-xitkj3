"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import React from "react";

export function ScrollBackground({ children }: { children: React.ReactNode }) {
  // Kita HAPUS ref sepenuhnya dan kembali ke WINDOW SCROLL.
  // Error "[browser] You have defined a target options but the provided ref is not yet hydrated"
  // terjadi karena Next.js Server Components (children) bermasalah saat dibungkus
  // dengan target ref Framer Motion pada saat hydration (render awal).
  // Menggunakan window scroll `useScroll()` secara langsung akan menghindari
  // error ini 100%, dan dengan viewBox serta mapping yang sudah diperbaiki,
  // garis akan mengikuti dengan sempurna.
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // KEMBALI KE LOGIKA ASLI SKIPER19 DENGAN GARIS SIMPEL!
  // IDE BRILIAN DARI ANDA: Kita "tambah speed" di awal!
  // - Di scroll 0 (paling atas): Garis bernilai 0 (TIDAK TAMPAK / SEMBUNYI).
  // - Di scroll 10% awal: Garis ngebut 2x lipat memanjang sampai 20% halaman.
  //   Ini membuat garis "ter-summon" dengan cepat dari atas lalu mengejar ke tengah layar.
  // - Di sisa halaman: Garis bergerak normal merayap turun menemani Anda sampai bawah.
  const pathLength = useTransform(smoothProgress, [0, 0.1, 1], [0, 0.2, 1]);

  return (
    <div className="relative w-full overflow-clip">
      {/**
       * KARENA PATH SEKARANG SIMPEL & LINEAR:
       * Kita BISA (dan harus) menggunakan h-full dan preserveAspectRatio="none".
       * Kenapa? Karena tinggi halaman bisa berbeda-beda tergantung layar (bisa 3000px, bisa 5000px).
       * Tanpa h-full, SVG ini ukurannya fix dan bisa jadi terputus di tengah jalan pada layar laptop.
       * Dengan h-full, SVG akan ditarik pas 100% tinggi halaman, memastikan ujung garis 
       * mendarat dengan sempurna di bagian paling bawah halaman (melewati jadwal piket).
       */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1278 2670"
        fill="none"
        overflow="visible"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className={[
          "absolute top-0 left-1/2 -translate-x-1/2 h-[115%] pointer-events-none",
          "opacity-30 mix-blend-multiply",
          "w-[150%] md:w-full",
          "max-w-none"
        ].join(" ")}
      >
        <motion.path
          d="M 1000 0 C 1000 400, 200 500, 200 900 C 200 1300, 1078 1400, 1078 1800 C 1078 2200, 400 2400, 300 2670"
          stroke="var(--color-accent-3)"
          strokeWidth="10"
          style={{ pathLength: pathLength }}
        />
      </svg>
      
      {children}
    </div>
  );
}
