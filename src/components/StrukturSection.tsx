import { getJabatanLabel } from "@/lib/jabatan";
import { StrukturCard } from "@/components/StrukturCard";

interface AnggotaData {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
}

export function StrukturSection({ anggota }: { anggota: AnggotaData[] }) {
  const byJabatan = (key: string) => anggota.filter((a) => a.jabatan === key);

  const waliKelas = byJabatan("wali_kelas");
  const ketua = byJabatan("ketua_kelas");
  const wakil = byJabatan("wakil_ketua");
  const sek1 = byJabatan("sekretaris_1");
  const sek2 = byJabatan("sekretaris_2");
  const ben1 = byJabatan("bendahara_1");
  const ben2 = byJabatan("bendahara_2");

  const adaData = anggota.some((a) => a.jabatan !== "anggota");

  if (!adaData) {
    return (
      <div className="mt-10 rounded-2xl border-2 border-dashed border-[rgba(66,72,212,0.2)] py-16 text-center font-body text-muted">
        Struktur kelas belum diatur. Admin bisa menambahkannya lewat panel
        admin dengan memilih jabatan struktural saat menambah anggota.
      </div>
    );
  }

  return (
    <>
      <div className="mt-12 w-full overflow-x-auto pb-6">
        <div className="mx-auto flex min-w-max flex-col items-center px-4">
          <Level people={waliKelas} variant="highlight" fallbackLabel={getJabatanLabel("wali_kelas")} />

          <Branch childCount={2}>
            <BranchNode>
              <Level people={ketua} fallbackLabel={getJabatanLabel("ketua_kelas")} />
            </BranchNode>
            <BranchNode>
              <Level people={wakil} fallbackLabel={getJabatanLabel("wakil_ketua")} />
            </BranchNode>
          </Branch>

          <Branch childCount={2}>
            <BranchNode>
              <div className="flex flex-col gap-4">
                <Level people={sek1} fallbackLabel={getJabatanLabel("sekretaris_1")} />
                <Level people={sek2} fallbackLabel={getJabatanLabel("sekretaris_2")} />
              </div>
            </BranchNode>
            <BranchNode>
              <div className="flex flex-col gap-4">
                <Level people={ben1} fallbackLabel={getJabatanLabel("bendahara_1")} />
                <Level people={ben2} fallbackLabel={getJabatanLabel("bendahara_2")} />
              </div>
            </BranchNode>
          </Branch>
        </div>
      </div>
    </>
  );
}

function Level({
  people,
  fallbackLabel,
  variant,
}: {
  people: AnggotaData[];
  fallbackLabel: string;
  variant?: "default" | "highlight";
}) {
  if (people.length === 0) {
    return (
      <div className="flex w-[136px] flex-col items-center rounded-2xl border-2 border-dashed border-[rgba(66,72,212,0.18)] px-3 py-3 text-center sm:w-[156px] lg:w-[176px]">
        <span className="font-body text-[9px] font-bold tracking-wide text-accent uppercase sm:text-[10px]">
          {fallbackLabel.toUpperCase()}
        </span>
        <span className="mt-1 font-body text-xs text-muted sm:mt-2 sm:text-sm">Belum diisi</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {people.map((p) => (
        <StrukturCard
          key={p.id}
          nama={p.nama}
          jabatan={fallbackLabel}
          fotoUrl={p.fotoUrl}
          variant={variant}
        />
      ))}
    </div>
  );
}



function Branch({
  children,
  childCount,
}: {
  children: React.ReactNode;
  childCount: number;
}) {
  const gapClass = childCount > 3 ? "gap-4 sm:gap-6" : "gap-6 sm:gap-10";

  return (
    <div className="flex flex-col items-center">
      <div className="h-5 w-0.5 rounded-full bg-[rgba(66,72,212,0.25)]" aria-hidden />
      {childCount > 1 ? (
        <div className={`flex ${gapClass} border-t-2 border-[rgba(66,72,212,0.2)] pt-5`}>
          {children}
        </div>
      ) : (
        <div className="flex flex-col items-center">{children}</div>
      )}
    </div>
  );
}

function BranchNode({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center">{children}</div>;
}
