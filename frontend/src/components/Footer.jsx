import { Link, useNavigate } from "react-router-dom";
import { Leaf, Instagram } from "lucide-react";

function ScrollLink({ to, children, ...props }) {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(to);
  };
  return <a href={to} onClick={handleClick} {...props}>{children}</a>;
}

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-[#FAF9F6] py-12 sm:py-16 md:py-20" data-testid="footer">
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <img src="/assets/logo-new.png" alt="Petal & Paw" className="h-14 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm font-light text-[#FAF9F6]/60 leading-relaxed max-w-xs">
              Pet-safe floral arrangements for the modern, conscious home. Because your pets deserve beautiful too.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-[#8DA399]">
                <Leaf size={14} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest font-semibold">100% Pet Safe</span>
              </div>
            </div>
            <a href="https://instagram.com/petalandpawflorist" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors" data-testid="footer-instagram">
              <Instagram size={16} strokeWidth={1.5} />
              <span className="text-xs font-light">@petalandpawflorist</span>
            </a>
            <a href="https://tiktok.com/@petalandpawflorist" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors" data-testid="footer-tiktok">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>
              <span className="text-xs font-light">@petalandpawflorist</span>
            </a>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6 text-[#FAF9F6]/40">Shop</h4>
            <nav className="flex flex-col gap-3">
              <ScrollLink to="/gallery" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-shop">Gallery</ScrollLink>
              <ScrollLink to="/gallery" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-bouquets">Bouquets</ScrollLink>
              <ScrollLink to="/subscriptions" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-subscriptions">Shop</ScrollLink>
              <ScrollLink to="/bouquet-builder" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-builder">Build a Bouquet</ScrollLink>
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6 text-[#FAF9F6]/40">Company</h4>
            <nav className="flex flex-col gap-3">
              <ScrollLink to="/about" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-about">About Us</ScrollLink>
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6 text-[#FAF9F6]/40">Support</h4>
            <nav className="flex flex-col gap-3">
              <ScrollLink to="/contact" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-contact">Contact</ScrollLink>
              <ScrollLink to="/events" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-events">Events</ScrollLink>
              <ScrollLink to="/faq" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-faq">FAQ</ScrollLink>
              <ScrollLink to="/returns" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-returns">Returns</ScrollLink>
            </nav>
          </div>
        </div>

        <div className="border-t border-[#FAF9F6]/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#FAF9F6]/40 font-light">
            &copy; {new Date().getFullYear()} Petal & Paw. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-[#FAF9F6]/40 font-light">Privacy Policy</span>
            <span className="text-xs text-[#FAF9F6]/40 font-light">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
