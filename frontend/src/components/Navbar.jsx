import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag, Menu, User } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { flurrySnow } from "@/lib/halloween";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/hire-us", label: "Hire Us" },
  { href: "/subscriptions", label: "Shop" },
  { href: "/workshops", label: "Workshops" },
  { href: "/vouchers", label: "Vouchers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function HolidayHat({ variant }) {
  const isElf = variant === "elf";
  return (
    <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true"
      className="holiday-hat absolute -top-3.5 left-1/2 pointer-events-none">
      {isElf ? (
        <path d="M3 14 L12 2 L18 14 Z" fill="#6E8F7A" />
      ) : (
        <path d="M3 14 Q8 3 16 1 Q15 6 19 14 Z" fill="#B5474A" />
      )}
      <circle cx={isElf ? 12 : 16.5} cy={isElf ? 2 : 1.5} r="1.6" fill="#FAF9F6" />
      <rect x="1" y="13" width="20" height="2.5" rx="1.2" fill="#FAF9F6" />
    </svg>
  );
}

export default function Navbar() {
  const { itemCount } = useCart();
  const { customer } = useCustomerAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  const handleNavClick = () => {
    scrollToTop();
    flurrySnow();
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
          {navLinks.map((link, index) => (
            <Link key={link.href} to={link.href} onClick={handleNavClick}
              className={`nav-link relative text-sm font-light tracking-wide transition-colors ${
                location.pathname === link.href ? "text-[#2C2C2C]" : "text-[#6B7280] hover:text-[#2C2C2C]"
              }`}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <HolidayHat variant={index % 2 === 0 ? "elf" : "santa"} />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to={customer ? "/account" : "/login"} onClick={scrollToTop} className="p-2 hover:bg-[#E8E4D9]/50 rounded-full transition-colors hidden md:flex" data-testid="nav-account">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/cart" onClick={scrollToTop} className="relative p-2 hover:bg-[#E8E4D9]/50 rounded-full transition-colors" data-testid="nav-cart">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#8DA399] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu-toggle"><Menu size={20} strokeWidth={1.5} /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#FAF9F6] border-l border-[#E5E0D6] w-72">
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
