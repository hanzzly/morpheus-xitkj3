"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { UserIcon, LogOutIcon } from "lucide-react";

const NAV_LINKS = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#struktur", label: "Struktur" },
  { href: "/#jadwal-piket", label: "Jadwal Piket" },
  { href: "/#anon-chat", label: "Text Anonim" },
];

interface AuthUser {
  isLoggedIn: boolean;
  role?: "admin" | "anggota";
  nama?: string;
  username?: string;
  fotoUrl?: string | null;
  email?: string;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {
      setUser({ isLoggedIn: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth, pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle hash scrolling when navigating from other pages to "/"
  useEffect(() => {
    if (pathname === "/" && typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const timer = setTimeout(() => {
        if (hash === "beranda") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const el = document.getElementById(hash);
        if (el) {
          const headerOffset = 72;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, offsetPosition), behavior: "smooth" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  function handleNavClick(href: string) {
    setMenuOpen(false);

    if (pathname === "/") {
      const targetId = href.replace("/#", "").replace("#", "");
      // Delay kecil agar animasi penutupan menu mobile selesai dan layout stabil
      setTimeout(() => {
        if (targetId === "beranda") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const el = document.getElementById(targetId);
        if (el) {
          const headerOffset = 72;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });
        }
      }, 150);
    } else {
      router.push(href);
    }
  }

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser({ isLoggedIn: false });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F5F2EB]/80 backdrop-blur-md border-b border-[rgba(66,72,212,0.12)] shadow-[0_2px_16px_rgba(66,72,212,0.08)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        {/* Brand — logo + teks */}
        <Link
          href="/#beranda"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("/#beranda");
          }}
          className="flex items-center gap-3 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logokelas-nobg.png"
            alt="Logo Kelas XI TKJ 3"
            className="h-10 w-10 object-contain rounded-xl"
          />
          <div className="flex flex-col leading-none">
            <span className="font-headline text-[15px] font-bold text-ink tracking-tight">
              XI TKJ 3 Morpheus
            </span>
            <span className="font-mono text-[8px] tracking-[0.18em] text-muted uppercase mt-0.5">
              SMK Telkom Malang
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="rounded-full px-4 py-2 font-body text-[13px] font-semibold text-muted transition-all hover:bg-[rgba(66,72,212,0.1)] hover:text-accent"
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/anggota"
            className="rounded-full px-4 py-2 font-body text-[13px] font-semibold text-muted transition-all hover:bg-[rgba(66,72,212,0.1)] hover:text-accent"
          >
            Anggota
          </Link>
          <Link
            href="/games"
            className="rounded-full px-4 py-2 font-body text-[13px] font-semibold text-muted transition-all hover:bg-[rgba(66,72,212,0.1)] hover:text-accent"
          >
            Games
          </Link>

          {/* Auth Button State */}
          {user?.isLoggedIn ? (
            <div className="ml-2 flex items-center gap-2">
              {user.role === "admin" ? (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-white font-body text-[13px] font-bold transition-all hover:bg-accent-2 shadow-[0_3px_0_rgba(50,56,184,1)]"
                >
                  ⚙️ Admin
                </Link>
              ) : (
                <Link
                  href="/member"
                  className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-white font-body text-[13px] font-bold transition-all hover:bg-accent-2 shadow-[0_3px_0_rgba(50,56,184,1)]"
                  title="Edit Profil Anggota"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">{user.nama ?? "Profil"}</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-full border border-[rgba(236,72,153,0.3)] bg-white/80 px-3 py-2 text-accent-3 font-body text-[13px] font-bold transition-all hover:bg-[rgba(236,72,153,0.1)]"
                title="Keluar"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/google/login"
              className="ml-2 flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-white font-body text-[13px] font-bold transition-all hover:bg-accent-2 shadow-[0_3px_0_rgba(50,56,184,1)]"
              title="Login Anggota"
            >
              <UserIcon className="h-3.5 w-3.5" />
              Login
            </a>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="group relative h-9 w-9 rounded-full text-ink transition-colors hover:bg-[rgba(66,72,212,0.1)] md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Buka menu navigasi"
          aria-expanded={menuOpen}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5px]">
            <span className={`h-[2px] w-4 bg-current rounded-full transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-[2px] w-4 bg-current rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-4 bg-current rounded-full transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[rgba(66,72,212,0.1)] bg-[#F5F2EB]/90 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col px-5 py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-xl px-4 py-3 text-left font-body text-sm font-semibold text-muted hover:bg-[rgba(66,72,212,0.08)] hover:text-accent"
                >
                  {link.label}
                </button>
              ))}
              <Link
                href="/anggota"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-left font-body text-sm font-semibold text-muted hover:bg-[rgba(66,72,212,0.08)] hover:text-accent"
              >
                Anggota
              </Link>
              <Link
                href="/games"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-left font-body text-sm font-semibold text-muted hover:bg-[rgba(66,72,212,0.08)] hover:text-accent"
              >
                Games
              </Link>

              {user?.isLoggedIn ? (
                <div className="mt-2 flex flex-col gap-2 border-t border-[rgba(66,72,212,0.1)] pt-3">
                  {user.role === "admin" ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-accent px-4 py-3 text-center font-body text-sm font-bold text-white hover:bg-accent-2"
                    >
                      ⚙️ Dashboard Admin
                    </Link>
                  ) : (
                    <Link
                      href="/member"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-accent px-4 py-3 text-center font-body text-sm font-bold text-white hover:bg-accent-2"
                    >
                      👤 Edit Profil ({user.nama ?? "Saya"})
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-[rgba(236,72,153,0.3)] bg-white px-4 py-3 text-center font-body text-sm font-bold text-accent-3 hover:bg-[rgba(236,72,153,0.08)]"
                  >
                    🚪 Keluar
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/google/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 rounded-full bg-accent px-4 py-3 text-center font-body text-sm font-bold text-white hover:bg-accent-2"
                >
                  Login Anggota
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
