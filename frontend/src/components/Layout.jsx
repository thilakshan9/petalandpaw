import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Bats from "@/components/Bats";
import { isHalloweenActive } from "@/lib/halloween";

export default function Layout({ children }) {
  const halloween = isHalloweenActive();
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2C2C] flex flex-col">
      <Bats active={halloween} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
