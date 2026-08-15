import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function AdminVisitorPanel() {
  let visitors: any[] = [];
  try {
    visitors = await prisma.visitor.findMany({
      orderBy: { visitedAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("Gagal load visitors:", error);
  }

  if (visitors.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-surface p-5 text-center text-sm text-muted">
        Belum ada data pengunjung.
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-border bg-surface overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink">
            Log Pengunjung
          </h2>
          <p className="mt-1 text-xs text-muted">
            Menampilkan 50 kunjungan terakhir
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-signal" />
          <span className="text-xs font-semibold text-accent">Live</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-ink">
          <thead className="bg-surface-2/50 text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Waktu</th>
              <th className="px-5 py-3 font-medium">IP Address</th>
              <th className="px-5 py-3 font-medium">Device/OS</th>
              <th className="px-5 py-3 font-medium">Browser</th>
              <th className="px-5 py-3 font-medium">Path</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visitors.map((v) => (
              <tr key={v.id} className="hover:bg-surface-2/30 transition-colors">
                <td className="px-5 py-3 whitespace-nowrap">
                  {new Date(v.visitedAt).toLocaleString("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{v.ip}</td>
                <td className="px-5 py-3">
                  <span className="font-medium text-accent-2">{v.device}</span>
                  <span className="text-muted text-xs ml-1">({v.os})</span>
                </td>
                <td className="px-5 py-3">{v.browser}</td>
                <td className="px-5 py-3 text-muted max-w-[150px] truncate" title={v.path}>
                  {v.path}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
