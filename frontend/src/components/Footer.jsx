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
            <img src="/assets/logo.png" alt="Petal & Paw" className="h-14 w-auto mb-4 brightness-0 invert" />
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
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6 text-[#FAF9F6]/40">Shop</h4>
            <nav className="flex flex-col gap-3">
              <ScrollLink to="/shop" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-shop">All Products</ScrollLink>
              <ScrollLink to="/shop?category=bouquet" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-bouquets">Bouquets</ScrollLink>
              <ScrollLink to="/subscriptions" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-subscriptions">Subscriptions</ScrollLink>
              <ScrollLink to="/bouquet-builder" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-builder">Build a Bouquet</ScrollLink>
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6 text-[#FAF9F6]/40">Company</h4>
            <nav className="flex flex-col gap-3">
              <ScrollLink to="/blog" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-blog">Journal</ScrollLink>
              <ScrollLink to="/about" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-about">About Us</ScrollLink>
              <span className="text-sm font-light text-[#FAF9F6]/70">Sustainability</span>
              <span className="text-sm font-light text-[#FAF9F6]/70">Pet Safety Promise</span>
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6 text-[#FAF9F6]/40">Support</h4>
            <nav className="flex flex-col gap-3">
              <ScrollLink to="/contact" className="text-sm font-light text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors" data-testid="footer-contact">Contact</ScrollLink>
              <span className="text-sm font-light text-[#FAF9F6]/70">FAQ</span>
              <span className="text-sm font-light text-[#FAF9F6]/70">Delivery Info</span>
              <span className="text-sm font-light text-[#FAF9F6]/70">Returns</span>
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
