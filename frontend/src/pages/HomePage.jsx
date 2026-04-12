import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Leaf, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch(`${API}/products?featured=true`)
      .then((r) => r.json())
      .then(setFeatured)
      .catch(console.error);
  }, []);

  return (
    <div>
      <SEOHead title="Home" description="Pet-safe floral arrangements for the modern, conscious home." image="https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=1200" />

      {/* Full-Width Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] min-h-[420px] md:min-h-[600px] overflow-hidden" data-testid="hero-section">
        <img
          src="https://images.unsplash.com/photo-1510771463146-e89e6e86560e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxkb2clMjBzbmlmZmluZyUyMGZsb3dlcnMlMjBnZW50bGUlMjBhZXN0aGV0aWN8ZW58MHx8fHwxNzczMDg1MDgyfDA&ixlib=rb-4.1.0&q=85&w=1920"
          alt="Dog with beautiful pet-safe flowers"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6]/90 via-[#FAF9F6]/60 to-[#FAF9F6]/20 md:from-[#FAF9F6]/80 md:via-[#FAF9F6]/40 md:to-transparent" />
        <div className="relative h-full container mx-auto px-5 md:px-8 max-w-7xl flex items-end pb-12 sm:items-center sm:pb-0">
          <div className="max-w-xl animate-fade-in-up">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">
              Pet-Safe Florals
            </span>
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-[#2C2C2C] mb-4 sm:mb-6">
              Flowers Your Pets Will Love Too
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#4B5563] mb-6 sm:mb-10 max-w-md">
              Hand-crafted arrangements using only verified pet-safe blooms.
            </p>
            <Link to="/gallery">
              <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-7 py-5 sm:px-10 sm:py-7 text-xs sm:text-sm uppercase tracking-[0.2em] transition-all hover:scale-105" data-testid="hero-shop-btn">
                View Gallery <ArrowRight size={16} className="ml-2 sm:ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promise Strip */}
      <section className="bg-white border-b border-[#E5E0D6]/50 py-4 sm:py-6" data-testid="promise-section">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-8 md:gap-16">
            {[
              { icon: ShieldCheck, text: "100% Pet Safe" },
              { icon: Leaf, text: "Sustainably Sourced" },
              { icon: Truck, text: "Free Delivery Over £50" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 text-[#6B7280]">
                <Icon size={15} strokeWidth={1.5} className="text-[#8DA399]" />
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: Pet-Safe Flowers */}
      <section className="py-14 sm:py-24 md:py-36" data-testid="feature-petsafe">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className="aspect-[4/5] max-h-[60vh] lg:max-h-none rounded-2xl overflow-hidden animate-fade-in-up">
              <img src="https://images.unsplash.com/photo-1548724582-1216ec5351ce?w=800" alt="Cat with safe flowers" className="w-full h-full object-cover" />
            </div>
            <div className="animate-fade-in-up delay-200">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">Every Stem Verified</span>
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4 sm:mb-6">
                Safe for Every Member of Your Family
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-6 sm:mb-8 max-w-md">
                Every flower we sell is carefully checked against scientific data. Just beautiful, worry-free blooms for homes with curious cats, playful dogs, and everything in between.
              </p>
              <Link to="/gallery">
                <Button variant="outline" className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FAF9F6] px-6 py-5 sm:px-8 sm:py-6 text-xs sm:text-sm uppercase tracking-[0.15em] transition-all" data-testid="feature-shop-btn">
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Letterbox Subscriptions */}
      <section className="py-14 sm:py-24 md:py-36 bg-white" data-testid="feature-subscriptions">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className="order-2 lg:order-1 animate-fade-in-up delay-200">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">Monthly Delivery</span>
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4 sm:mb-6">
                Pet-Safe Letterbox Subscriptions
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-6 sm:mb-8 max-w-md">
                Fresh, seasonal flowers delivered through your letterbox every month. Three plans to choose from, each one guaranteed pet-safe. Surprise your pet with a toy by adding to any subscription.
              </p>
              <Link to="/subscriptions">
                <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-6 py-5 sm:px-8 sm:py-6 text-xs sm:text-sm uppercase tracking-[0.15em] transition-all hover:scale-105" data-testid="feature-sub-btn">
                  View Plans <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 aspect-[4/5] max-h-[60vh] lg:max-h-none rounded-2xl overflow-hidden animate-fade-in-up">
              <img src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800" alt="Letterbox flower subscription" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Bouquet Builder */}
      <section className="py-14 sm:py-24 md:py-36" data-testid="feature-builder">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className="aspect-[4/5] max-h-[60vh] lg:max-h-none rounded-2xl overflow-hidden animate-fade-in-up">
              <img src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800" alt="Create your own bouquet" className="w-full h-full object-cover" />
            </div>
            <div className="animate-fade-in-up delay-200">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">Personalise</span>
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4 sm:mb-6">
                Create Your Own Bouquet
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-6 sm:mb-8 max-w-md">
                Coming Soon
              </p>
              <Link to="/bouquet-builder">
                <Button variant="outline" className="rounded-full border-[#E5E0D6] text-[#6B7280] px-6 py-5 sm:px-8 sm:py-6 text-xs sm:text-sm uppercase tracking-[0.15em] cursor-not-allowed opacity-50" data-testid="feature-builder-btn" disabled>
                  Start Building
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 sm:py-24 md:py-32 bg-white" data-testid="featured-products">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Curated</span>
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C]">Featured Blooms</h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors" data-testid="view-all-products">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {featured.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors" data-testid="view-all-products-mobile">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
