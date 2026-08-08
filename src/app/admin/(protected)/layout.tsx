import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <AdminSidebar />
      <div className="flex-1 bg-base">{children}</div>
    </div>
  );
}
