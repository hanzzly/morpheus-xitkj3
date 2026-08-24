"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/admin/anggota", label: "Anggota", emoji: "👥" },
  { href: "/admin/galeri", label: "Galeri", emoji: "🖼️" },
  { href: "/admin/prestasi", label: "Prestasi", emoji: "🏆" },
  { href: "/admin/jadwal-piket", label: "Jadwal Piket", emoji: "📅" },
  { href: "/admin/chat", label: "Chat Anonim", emoji: "💬" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-[rgba(66,72,212,0.12)] bg-surface sm:w-60">
      {/* Brand */}
      <div className="border-b border-[rgba(66,72,212,0.1)] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent font-mono text-xs font-bold text-white">
            {"</>"}
          </span>
          <div>
            <p className="font-headline text-sm font-bold text-ink">
              Admin Panel
            </p>
            <p className="font-mono text-[9px] tracking-wide text-muted uppercase">XI TKJ 3 Morpheus</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-body text-sm font-semibold transition-all ${
                isActive
                  ? "bg-accent text-white shadow-[0_3px_0_rgba(50,56,184,1)]"
                  : "text-muted hover:bg-[rgba(66,72,212,0.08)] hover:text-accent"
              }`}
            >
              <span>{link.emoji}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(66,72,212,0.1)] p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-muted transition-all hover:bg-[rgba(66,72,212,0.08)] hover:text-accent"
        >
          🌐 Lihat situs publik
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-body text-sm font-semibold text-muted transition-all hover:bg-[rgba(236,72,153,0.08)] hover:text-accent-3"
        >
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}
