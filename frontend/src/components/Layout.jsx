import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Snow from "@/components/Snow";
import Bats from "@/components/Bats";
import { getActiveSeason } from "@/lib/halloween";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const season = getActiveSeason();
  const seasonalPage = pathname === "/workshops" || pathname === "/seasonal";
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2C2C] flex flex-col">
      <Snow active={season === "christmas"} />
      <Bats active={season === "halloween" && seasonalPage} ambient={pathname === "/seasonal"} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
