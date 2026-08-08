// Definisi hierarki jabatan struktur organisasi kelas.
// `level` menentukan tingkatan di org-chart (0 = paling atas).
// Beberapa jabatan memang boleh diisi lebih dari satu orang (misal Sekretaris, Bendahara, tiap Seksi).

export interface JabatanDef {
  key: string;
  label: string;
  level: number;
}

export const JABATAN_LIST: JabatanDef[] = [
  { key: "wali_kelas", label: "Wali Kelas", level: 0 },
  { key: "ketua_kelas", label: "Ketua Kelas", level: 1 },
  { key: "wakil_ketua", label: "Wakil Ketua", level: 1 },
  { key: "sekretaris_1", label: "Sekretaris 1", level: 2 },
  { key: "sekretaris_2", label: "Sekretaris 2", level: 2 },
  { key: "bendahara_1", label: "Bendahara 1", level: 2 },
  { key: "bendahara_2", label: "Bendahara 2", level: 2 },
  { key: "anggota", label: "Anggota", level: 3 },
];

export function getJabatanLabel(key: string): string {
  return JABATAN_LIST.find((j) => j.key === key)?.label ?? key;
}
