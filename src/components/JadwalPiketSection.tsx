interface JadwalData {
  id: string;
  hari: string;
  anggota: { id: string; nama: string };
}

const HARI_URUTAN = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"] as const;

const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
};

export function JadwalPiketSection({ jadwal }: { jadwal: JadwalData[] }) {
  // Gunakan zona waktu Jakarta (WIB) untuk mencegah bug perbedaan hari saat dihosting di Vercel (UTC)
  const now = new Date();
  const jakartaTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const jakartaDate = new Date(jakartaTimeString);
  const hariIniIndex = jakartaDate.getDay();
  const hariIni = hariIniIndex > 0 && hariIniIndex <= 5 ? HARI_URUTAN[hariIniIndex - 1] : undefined;

  let namaHariLibur = "Hari Libur";
  if (hariIniIndex === 0) namaHariLibur = "Hari Minggu";
  if (hariIniIndex === 6) namaHariLibur = "Hari Sabtu";

  const displayHari = hariIni ? [hariIni] : [];

  return (
    <div className="mx-auto max-w-lg">
      {displayHari.length === 0 ? (
        <div className="solid-card p-8 text-center">
          <h3 className="font-headline text-xl font-bold text-ink">{namaHariLibur}</h3>
          <p className="mt-2 font-body text-sm text-muted">Tidak ada jadwal piket hari ini. Selamat istirahat!</p>
        </div>
      ) : (
        displayHari.map((hari) => {
          const petugasHariIni = jadwal.filter((j) => j.hari === hari);
          const isToday = hari === hariIni;

          return (
            <div
              key={hari}
              className={`solid-card p-6 ${
                isToday ? "ring-2 ring-accent" : ""
              }`}
            >
              {/* Header hari */}
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold text-ink uppercase">
                  {HARI_LABEL[hari]}
                </h3>
                {isToday && (
                  <span className="nexus-badge bg-accent-3">
                    Hari Ini ✨
                  </span>
                )}
              </div>

              {/* Daftar petugas */}
              {petugasHariIni.length === 0 ? (
                <p className="mt-4 font-body text-sm text-muted">Belum ada petugas.</p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {petugasHariIni.map((j) => (
                    <li key={j.id} className="flex items-center gap-2.5 font-body text-sm text-ink">
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                      {j.anggota.nama}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
