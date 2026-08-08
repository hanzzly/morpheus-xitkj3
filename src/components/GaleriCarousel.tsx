"use client";

import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";

import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

export interface GaleriSlideImage {
  src: string;
  judul: string;
  deskripsi: string | null;
}

/**
 * Carousel galeri kegiatan kelas, efek coverflow.
 * Diadaptasi dari komponen open-source Skiper UI (Carousel_003) untuk dipakai
 * dengan data dinamis dari database dan tema visual kelas ini.
 */
export function GaleriCarousel({
  images,
  className,
}: {
  images: GaleriSlideImage[];
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [toggledIdx, setToggledIdx] = useState<number | null>(null);
  
  useEffect(() => setMounted(true), []);

  const css = `
    .galeri-carousel-swiper {
      width: 100%;
      height: 380px;
      padding-bottom: 56px !important;
    }
    @media (min-width: 768px) {
      .galeri-carousel-swiper {
        height: 480px;
      }
    }

    .galeri-carousel-swiper .swiper-slide {
      background-position: center;
      background-size: cover;
      width: 280px;
      border-radius: 20px;
      overflow: hidden;
    }
    @media (min-width: 768px) {
      .galeri-carousel-swiper .swiper-slide {
        width: 440px;
      }
    }

    .galeri-carousel-swiper .swiper-pagination-bullet {
      background-color: var(--color-accent) !important;
      opacity: 0.3;
    }

    .galeri-carousel-swiper .swiper-pagination-bullet-active {
      opacity: 1;
      background-color: var(--color-accent) !important;
      transform: scale(1.3);
    }
  `;

  if (!mounted) {
    return <div className="mx-auto h-[380px] w-full px-4 md:h-[480px] md:px-0 lg:max-w-[100vw]" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={cn("relative mx-auto w-full px-4 md:px-0 lg:max-w-[100vw]", className)}
    >
      <style>{css}</style>

      <Swiper
        spaceBetween={0}
        autoplay={{ delay: 3200, disableOnInteraction: true }}
        effect="coverflow"
        grabCursor
        slidesPerView="auto"
        centeredSlides
        loop={images.length > 2}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".galeri-nav-next",
          prevEl: ".galeri-nav-prev",
        }}
        className="galeri-carousel-swiper"
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="group relative">
            <GaleriSlideCard image={image} />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        aria-label="Foto sebelumnya"
        className="galeri-nav-prev absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-[rgba(66,72,212,0.2)] bg-white p-2.5 text-accent backdrop-blur-sm transition-all hover:bg-accent hover:text-white md:left-8"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        aria-label="Foto selanjutnya"
        className="galeri-nav-next absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-[rgba(66,72,212,0.2)] bg-white p-2.5 text-accent backdrop-blur-sm transition-all hover:bg-accent hover:text-white md:right-8"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

function GaleriSlideCard({ image }: { image: GaleriSlideImage }) {
  const [toggled, setToggled] = useState(false);

  return (
    <div
      className="group/card relative h-full w-full overflow-hidden rounded-[20px]"
      onClick={() => {
        if (window.innerWidth < 768) {
          setToggled(!toggled);
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        src={image.src}
        alt={image.judul}
        loading="lazy"
      />
      {/* Overlay Deskripsi */}
      <div
        className={cn(
          "absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 transition-opacity duration-300 md:group-hover/card:opacity-100",
          toggled ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-1 transition-transform duration-300 w-full",
            "translate-y-4 md:group-hover/card:translate-y-0",
            toggled && "translate-y-0"
          )}
        >
          <h3
            className="font-body text-sm font-bold sm:text-base drop-shadow-md"
            style={{ color: "#f9a8d4" }}
          >
            {image.judul}
          </h3>
          {image.deskripsi && (
            <p className="font-body text-xs text-white/90 line-clamp-3 leading-relaxed drop-shadow-sm">
              {image.deskripsi}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
