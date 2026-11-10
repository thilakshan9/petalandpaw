import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Snow from "@/components/Snow";
import Bats from "@/components/Bats";
import CookieConsent from "@/components/CookieConsent";
import { getActiveSeason } from "@/lib/halloween";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const season = getActiveSeason();
  const seasonalPage = pathname === "/workshops";
  return (
    <div className={`min-h-screen bg-[#FAF9F6] text-[#2C2C2C] flex flex-col ${season === "christmas" ? "xmas-theme" : ""}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Snow persistent />
      <Bats active={season === "halloween" && seasonalPage} />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
