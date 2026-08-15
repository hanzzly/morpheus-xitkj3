import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EyeIcon } from "lucide-react";

export default async function Footer() {
  let visitorCount = 0;
  try {
    visitorCount = await prisma.visitor.count();
  } catch (error) {
    console.error("Failed to fetch visitor count:", error);
  }

  return (
    <footer id="footer" className="relative bg-accent">
      {/* Strip bubbly ala Morpheus */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        {/* Kiri — brand */}
        <div className="flex items-center gap-2">
          <span className="pulse-dot h-2 w-2 flex-shrink-0 rounded-full bg-signal" />
          <div className="flex flex-col leading-none">
            <span className="font-headline text-sm font-bold text-white tracking-tight">
              XI TKJ 3 Morpheus
            </span>
            <span className="font-mono text-[8px] tracking-[0.15em] text-white/60 uppercase mt-0.5">
              Cyber Security Class
            </span>
          </div>
        </div>

        {/* Tengah — info */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="pulse-dot h-2 w-2 flex-shrink-0 rounded-full bg-signal" />
          <span className="font-body text-[11px] font-semibold tracking-wide text-white/80 uppercase">
            SMK Telkom Malang
          </span>
        </div>

        {/* Kanan — tahun & visitor */}
        <div className="flex items-center gap-3">
          {/* Visitor Count */}
          <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 font-body text-[10px] font-medium text-white/90">
            <EyeIcon className="h-3 w-3" />
            <span>Visitor: {visitorCount.toLocaleString('id-ID')}</span>
          </div>

          <span className="font-mono text-[10px] tracking-wide text-white/50">
            © {new Date().getFullYear()}
          </span>
          <Link
            href="/"
            className="rounded-full bg-white/20 px-3 py-1.5 font-body text-[11px] font-bold text-white transition-all hover:bg-white/30"
          >
            Beranda
          </Link>
        </div>
      </div>
    </footer>
  );
}
