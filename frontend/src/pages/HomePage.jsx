import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Leaf, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import SeasonalPopup from "@/components/SeasonalPopup";

export default function HomePage() {
  return (
    <div>
      <SEOHead title="Home" description="Pet-safe floral arrangements for the modern, conscious home." image="https://lh3.googleusercontent.com/d/17eTVpte-bc4RkhtYq0-WlCXYnI6DTILz=w1200" />

      {/* Full-Width Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] min-h-[420px] md:min-h-[600px] overflow-hidden" data-testid="hero-section">
        <img
          src="https://lh3.googleusercontent.com/d/1KIlARmnFdSkxUVp2I_mTEnMp9gtLC4iA=w1920"
          alt="Dog with beautiful pet-safe flowers"
          className="absolute inset-0 w-full h-full object-cover object-[center_70%]"
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
              Hand-crafted arrangements using only pet-safe blooms.
            </p>
            <Link to="/subscriptions">
              <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-7 py-5 sm:px-10 sm:py-7 text-xs sm:text-sm uppercase tracking-[0.2em] transition-all hover:scale-105" data-testid="hero-shop-btn">
                Shop Now <ArrowRight size={16} className="ml-2 sm:ml-3" />
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
              { icon: ShieldCheck, text: "Pet Safe" },
              { icon: Leaf, text: "Sustainably Sourced" },
              { icon: Truck, text: "Free UK Delivery" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 text-[#6B7280]">
                <Icon size={15} strokeWidth={1.5} className="text-[#8DA399]" />
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: Workshops */}
      <section className="py-14 sm:py-24 md:py-36" data-testid="feature-workshops">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className="aspect-[4/5] max-h-[60vh] lg:max-h-none rounded-2xl overflow-hidden animate-fade-in-up">
              <img src="https://lh3.googleusercontent.com/d/10eVZW0mATKtuTyfynNGdbw7e1j_oGM79=w800" alt="Flower arranging workshops" className="w-full h-full object-cover" />
            </div>
            <div className="animate-fade-in-up delay-200">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">Learn & Create</span>
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4 sm:mb-6">
                Workshops
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-6 sm:mb-8 max-w-md">
                Join us for a relaxed flower arranging experience. Create your own pet-safe bouquet to take home, meet like-minded people, and enjoy a creative session in good company.
              </p>
              <Link to="/workshops">
                <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-6 py-5 sm:px-8 sm:py-6 text-xs sm:text-sm uppercase tracking-[0.15em] transition-all hover:scale-105" data-testid="feature-workshops-btn">
                  View Workshops <ArrowRight size={14} className="ml-2" />
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
                Pet-Safe Subscriptions
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-6 sm:mb-8 max-w-md">
                Fresh, seasonal flowers delivered to your door every month. Three plans to choose from, each one guaranteed non-toxic. Surprise your pet with a toy by adding to any subscription.
              </p>
              <Link to="/subscriptions">
                <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-6 py-5 sm:px-8 sm:py-6 text-xs sm:text-sm uppercase tracking-[0.15em] transition-all hover:scale-105" data-testid="feature-sub-btn">
                  View Plans <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 aspect-[4/5] max-h-[60vh] lg:max-h-none rounded-2xl overflow-hidden animate-fade-in-up">
              <img src="https://lh3.googleusercontent.com/d/1370ARPVzWwmFKtFgU16SPBLPplTtGn9l=w800" alt="Letterbox flower subscription" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Pet-Safe Flowers (More Info) */}
      <section className="py-14 sm:py-24 md:py-36" data-testid="feature-petsafe">
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className="aspect-[4/5] max-h-[60vh] lg:max-h-none rounded-2xl overflow-hidden animate-fade-in-up">
              <img src="https://lh3.googleusercontent.com/d/16IURvclMQzZnIucglfEbfgsZFeegijRb=w800" alt="Cat with safe flowers" className="w-full h-full object-cover" />
            </div>
            <div className="animate-fade-in-up delay-200">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">Every Stem Pet-Safe</span>
              <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4 sm:mb-6">
                Safe for Every Member of Your Family
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-6 sm:mb-8 max-w-md">
                Every flower we sell is carefully checked against scientific data. Just beautiful, worry-free blooms for homes with curious cats, playful dogs, and everything in between.
              </p>
              <Link to="/safe-flowers">
                <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-6 py-5 sm:px-8 sm:py-6 text-xs sm:text-sm uppercase tracking-[0.15em] transition-all hover:scale-105" data-testid="feature-shop-btn">
                More Info <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SeasonalPopup />
    </div>
  );
}
