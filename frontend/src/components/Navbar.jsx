import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag, Menu, User } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { flurrySnow, isChristmasActive } from "@/lib/halloween";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/wreath-kit", label: "Wreath Kit" },
  { href: "/subscriptions", label: "Shop" },
  { href: "/workshops", label: "Workshops" },
  { href: "/vouchers", label: "Vouchers" },
  { href: "/hire-us", label: "Hire Us" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function SantaHat({ className }) {
  return (
    <svg viewBox="0 0 40 30" aria-hidden="true" className={`santa-hat absolute pointer-events-none ${className}`}>
      <path d="M6 22 Q14 4 34 4 Q30 14 32 22 Z" fill="#B5474A" stroke="#2C2C2C" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="34" cy="4" r="3.5" fill="#FAF9F6" stroke="#2C2C2C" strokeWidth="1" />
      <rect x="3" y="20" width="32" height="6" rx="3" fill="#FAF9F6" stroke="#2C2C2C" strokeWidth="1" />
    </svg>
  );
}

const SPARKLE_COUNT = 8;

function SparkleBurst({ onDone }) {
  return (
    <span className="sparkle-burst" aria-hidden="true" onAnimationEnd={onDone}>
      {Array.from({ length: SPARKLE_COUNT }, (_, i) => (
        <span key={i} className="sparkle-particle" style={{ "--angle": `${(360 / SPARKLE_COUNT) * i}deg` }} />
      ))}
    </span>
  );
}

export default function Navbar() {
  const { itemCount } = useCart();
  const { customer } = useCustomerAuth();
  const location = useLocation();
  const isChristmas = isChristmasActive();
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(null);
  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  const handleNavClick = () => {
    scrollToTop();
    flurrySnow();
  };
  const handleTabClick = (href) => {
    setBurst({ href, id: Date.now() });
    handleNavClick();
  };
  const handleMobileLinkClick = () => {
    setOpen(false);
    handleNavClick();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E0D6]/50" data-testid="navbar">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex items-center justify-between h-16 md:h-20">
        <Link to="/" onClick={scrollToTop} className="flex items-center gap-2" data-testid="nav-logo">
          <img src="/assets/logo-new.png" alt="Petal & Paw" className="h-10 md:h-12 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} onClick={() => handleTabClick(link.href)}
              className={`nav-link relative text-sm font-light tracking-wide transition-colors ${
                location.pathname === link.href ? "text-[#2C2C2C]" : "text-[#6B7280] hover:text-[#2C2C2C]"
              }`}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              {link.label}
              {location.pathname === link.href && <span className="candy-underline" />}
              {burst?.href === link.href && <SparkleBurst key={burst.id} onDone={() => setBurst(null)} />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to={customer ? "/account" : "/login"} onClick={scrollToTop} aria-label="My account" className="nav-icon-btn p-2 hover:bg-[#E8E4D9]/50 rounded-full transition-colors hidden md:flex" data-testid="nav-account">
            <span className="relative inline-flex">
              <User size={20} strokeWidth={1.5} />
              {isChristmas && <SantaHat className="-top-2 left-1/2 -translate-x-1/2 w-3.5 h-auto" />}
            </span>
          </Link>
          <Link to="/cart" onClick={scrollToTop} aria-label={`Basket, ${itemCount} ${itemCount === 1 ? "item" : "items"}`} className="nav-icon-btn relative p-2 hover:bg-[#E8E4D9]/50 rounded-full transition-colors" data-testid="nav-cart">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#8DA399] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu" data-testid="mobile-menu-toggle"><Menu size={20} strokeWidth={1.5} /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="mobile-menu-sheet bg-[#FAF9F6] border-l border-[#E5E0D6] w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="menu-candy-band absolute inset-x-0 top-0 h-2" aria-hidden="true" />
              <div className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href} onClick={handleMobileLinkClick}
                    className="text-lg font-light tracking-wide text-[#2C2C2C] hover:text-[#8DA399] transition-colors"
                    data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  >{link.label}</Link>
                ))}
                <div className="border-t border-[#E5E0D6] pt-6 mt-2 space-y-4">
                  <Link to="/account" onClick={handleMobileLinkClick} className="block text-base font-light text-[#2C2C2C] hover:text-[#8DA399]" data-testid="mobile-nav-account">My Account</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
