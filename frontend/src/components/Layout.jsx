import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Bats from "@/components/Bats";
import Snow from "@/components/Snow";
import { getActiveSeason } from "@/lib/halloween";

export default function Layout({ children }) {
  const season = getActiveSeason();
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2C2C] flex flex-col">
      <Bats active={season === "halloween"} />
      <Snow active={season === "christmas"} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
