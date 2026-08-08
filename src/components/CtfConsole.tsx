"use client";

import { useEffect } from "react";

/**
 * CtfConsole — menyembunyikan bagian flag CTF di browser console.
 * Tidak ada output visual. Komponen ini invisible di halaman.
 */
export default function CtfConsole() {
  useEffect(() => {
    // Sedikit delay agar tidak langsung keliatan
    const t = setTimeout(() => {
      console.log(
        "%c\uD83D\uDD10 Kelas Cyber Security \u2014 XI TKJ 3",
        "color: #c8ff00; background: #0d0d0d; font-weight: bold; font-size: 14px; padding: 6px 12px; border-radius: 4px;"
      );
      console.log(
        "%c[ PART 2/3 ] :: m3_900D_J0B_",
        "color: #22c55e; font-family: monospace; font-size: 12px; padding: 4px 0;"
      );
      console.log(
        "%cOne more piece is hiding somewhere else on this site...",
        "color: #6b7280; font-size: 11px; font-style: italic;"
      );
    }, 800);

    return () => clearTimeout(t);
  }, []);

  return null;
}
