"use client";

import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";
import { EffectCards, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css";

import { cn } from "@/lib/utils";

export interface PrestasiData {
  id: string;
  judul: string;
  deskripsi: string;
  gambarUrl: string;
}

export function PrestasiSection({
  prestasi,
  className,
}: {
  prestasi: PrestasiData[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!prestasi || prestasi.length === 0) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl border-2 border-dashed border-[rgba(66,72,212,0.2)] py-16 text-center font-body text-muted">
        Belum ada data prestasi.
      </div>
    );
  }

  const activePrestasi = prestasi[activeIndex] || prestasi[0];

  const css = `
  .prestasi-carousel-wrapper {
    padding-bottom: 48px;
  }
  .prestasi-swiper .swiper-slide {
    border-radius: 24px;
    box-shadow: 4px 4px 0px rgba(66,72,212,0.25);
  }
  `;

  return (
    <div className={cn("mx-auto flex w-full max-w-5xl flex-col items-center gap-14 md:flex-row md:items-center lg:gap-24", className)}>
      <style>{css}</style>
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="prestasi-carousel-wrapper relative w-full shrink-0 flex justify-center md:w-[340px] md:justify-start lg:w-[360px]"
      >
        <Swiper
          effect="cards"
          grabCursor={true}
          loop={false}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          navigation={{
            nextEl: ".prestasi-nav-next",
            prevEl: ".prestasi-nav-prev",
          }}
          modules={[EffectCards, Navigation]}
          className="prestasi-swiper h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]"
        >
          {prestasi.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="h-full w-full object-cover"
                src={item.gambarUrl}
                alt={item.judul}
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation — rounded, blue/pink */}
        <div className="absolute -bottom-1 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 md:left-1/2">
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted/60 uppercase select-none">
            swipe
          </span>
          <div className="flex gap-3">
            <button className="prestasi-nav-prev flex h-9 w-9 items-center justify-center rounded-full border-2 border-[rgba(66,72,212,0.2)] bg-white text-accent shadow-sm transition-all hover:bg-accent hover:text-white after:hidden">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button className="prestasi-nav-next flex h-9 w-9 items-center justify-center rounded-full border-2 border-[rgba(66,72,212,0.2)] bg-white text-accent shadow-sm transition-all hover:bg-accent hover:text-white after:hidden">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Kanan: Judul & Deskripsi Prestasi */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-1 flex-col text-center md:text-left"
      >
        <span className="section-label mb-3">
          Prestasi #{activeIndex + 1}
        </span>
        
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="nexus-headline text-3xl sm:text-4xl lg:text-5xl" style={{ textTransform: "none" }}>
            {activePrestasi.judul}
          </h3>
          <p className="mt-5 font-body text-sm leading-relaxed text-muted sm:text-base md:pr-10">
            {activePrestasi.deskripsi}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
