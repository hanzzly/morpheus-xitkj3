import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { VisitorTracker } from "@/components/VisitorTracker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <VisitorTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
