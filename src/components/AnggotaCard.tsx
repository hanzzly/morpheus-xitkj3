"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getJabatanLabel } from "@/lib/jabatan";

export function AnggotaCard({
  nama,
  jabatan,
  fotoUrl,
  bio,
  portofolio,
}: {
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
  bio: string | null;
  portofolio: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="solid-card group cursor-pointer p-4 text-center transition-all"
      >
        {/* Avatar */}
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-3 ring-[rgba(66,72,212,0.2)] bg-surface-2 transition-all group-hover:ring-accent/50">
          {fotoUrl ? (
            <Image
              src={fotoUrl}
              alt={nama}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent font-headline text-xl font-bold text-white">
              {nama.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Nama */}
        <h3 className="mt-3 font-body text-sm font-bold text-ink leading-tight">
          {nama}
        </h3>

        {/* Jabatan badge — hot pink */}
        <span className="mt-2 inline-block rounded-full bg-accent-3 px-3 py-0.5 font-body text-[9px] font-bold tracking-wide text-white uppercase">
          {getJabatanLabel(jabatan)}
        </span>

        {/* Bio */}
        {bio && (
          <p className="mt-2 font-body text-[11px] leading-relaxed text-muted line-clamp-3">
            {bio}
          </p>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-3xl cursor-default flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl md:flex-row text-left border-2 border-[rgba(66,72,212,0.12)]"
            >
              {/* Tombol Tutup */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base text-muted transition-colors hover:bg-[rgba(66,72,212,0.1)] hover:text-accent font-bold"
              >
                ✕
              </button>

              {/* Bagian Kiri: Foto, Nama, Bio */}
              <div className="flex flex-col items-center justify-center border-b border-[rgba(66,72,212,0.1)] bg-base p-8 md:w-2/5 md:border-b-0 md:border-r">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-surface-2 ring-4 ring-[rgba(66,72,212,0.2)] sm:h-32 sm:w-32">
                  {fotoUrl ? (
                    <Image src={fotoUrl} alt={nama} fill sizes="128px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent font-headline text-3xl font-bold text-white">
                      {nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="mt-5 text-center font-body text-xl font-bold text-ink">{nama}</h3>
                <span className="mt-2 rounded-full bg-accent-3 px-3 py-1 font-body text-[10px] font-bold tracking-wide text-white uppercase">
                  {getJabatanLabel(jabatan)}
                </span>
                <p className="mt-4 text-center font-body text-sm text-muted">
                  {bio || "Belum ada bio."}
                </p>
              </div>

              {/* Bagian Kanan: Portofolio */}
              <div className="flex flex-col p-8 md:w-3/5">
                <h4 className="flex items-center gap-2 font-body text-lg font-bold text-ink">
                  <span className="h-2.5 w-2.5 rounded-full bg-signal" />
                  Portofolio
                </h4>
                <div className="mt-4 flex-1 whitespace-pre-wrap rounded-2xl border border-[rgba(66,72,212,0.12)] bg-base p-4 font-body text-sm text-ink overflow-y-auto max-h-[300px]">
                  {portofolio ? (
                    portofolio
                  ) : (
                    <span className="italic text-muted">Belum ada portofolio.</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
