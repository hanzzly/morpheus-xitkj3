import Image from "next/image";

export function StrukturCard({
  nama,
  jabatan,
  fotoUrl,
  bio,
  portofolio,
  variant = "default",
}: {
  nama: string;
  jabatan?: string;
  fotoUrl?: string | null;
  bio?: string | null;
  portofolio?: string | null;
  variant?: "default" | "highlight";
}) {
  const isHighlight = variant === "highlight";

  return (
    <div
      className={`solid-card flex w-[136px] flex-col items-center px-3 py-4 text-center sm:w-[156px] lg:w-[176px] ${
        isHighlight ? "ring-3 ring-accent" : ""
      }`}
    >
      {/* Avatar */}
      <div className={`relative h-12 w-12 overflow-hidden rounded-full bg-surface-2 ring-2 sm:h-16 sm:w-16 ${isHighlight ? "ring-accent/50" : "ring-[rgba(66,72,212,0.15)]"}`}>
        {fotoUrl ? (
          <Image src={fotoUrl} alt={nama} fill sizes="(max-width: 640px) 48px, 64px" className="object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center font-headline text-base font-bold sm:text-lg ${isHighlight ? "bg-accent text-white" : "bg-accent-3 text-white"}`}>
            {nama.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Jabatan */}
      {jabatan && (
        <span
          className={`mt-2 rounded-full px-2 py-0.5 font-body text-[9px] font-bold tracking-wide uppercase sm:mt-2.5 ${
            isHighlight
              ? "bg-accent text-white"
              : "bg-accent-3 text-white"
          }`}
        >
          {jabatan.toUpperCase()}
        </span>
      )}

      {/* Nama */}
      <span className="mt-1.5 w-full break-words text-balance font-body text-xs font-bold leading-snug text-ink sm:text-sm">
        {nama}
      </span>
    </div>
  );
}
