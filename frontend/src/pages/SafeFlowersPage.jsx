import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const DOG_ONLY = ["Scabiosa"];
const CAT_ONLY = ["Trachelium"];
const BOTH = [
  "Astilbe", "Erica", "Freesia", "Greenbell", "Lisianthus", "Limonium",
  "Olive", "Pitto", "Pussy Willow", "Roses", "Snapdragons", "Statice",
  "Stock", "Veronica", "Sunflowers", "Waxflower"
];

export default function SafeFlowersPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="safe-flowers-page">
      <SEOHead title="Pet-Safe Flowers" description="A complete guide to flowers that are safe for cats and dogs. Sourced via Blue Cross." />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Pet Safety</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Pet-Safe Flower Guide
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Every stem we use is carefully selected to be safe for your furry family members. Here's the full list.
          </p>
        </div>

        {/* Venn Diagram */}
        <div className="animate-fade-in-up delay-100 mb-16">
          <div className="relative max-w-3xl mx-auto">
            {/* Desktop Venn */}
            <div className="hidden md:flex items-center justify-center relative" style={{ minHeight: "480px" }}>
              {/* Dog circle */}
              <div className="absolute left-0 w-[340px] h-[460px] rounded-full border-2 border-[#B8926A]/30 bg-[#B8926A]/5 flex flex-col items-start justify-center pl-10 pr-24">
                <div className="mb-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#B8926A]">Dogs Only</span>
                </div>
                {DOG_ONLY.map((f) => (
                  <span key={f} className="text-sm font-light text-[#4B5563] leading-relaxed">{f}</span>
                ))}
              </div>

              {/* Overlap / Both */}
              <div className="relative z-10 w-[260px] flex flex-col items-center justify-center py-6">
                <div className="mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8DA399]">Both</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E0D6] p-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {BOTH.map((f) => (
                      <span key={f} className="text-sm font-light text-[#2C2C2C] leading-relaxed">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cat circle */}
              <div className="absolute right-0 w-[340px] h-[460px] rounded-full border-2 border-[#C4A2B0]/30 bg-[#C4A2B0]/5 flex flex-col items-end justify-center pr-10 pl-24">
                <div className="mb-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C4A2B0]">Cats Only</span>
                </div>
                {CAT_ONLY.map((f) => (
                  <span key={f} className="text-sm font-light text-[#4B5563] leading-relaxed">{f}</span>
                ))}
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden space-y-6">
              <div className="bg-[#8DA399]/5 border border-[#8DA399]/20 rounded-2xl p-6">
                <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-4">Safe for Both Cats & Dogs</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {BOTH.map((f) => (
                    <span key={f} className="text-sm font-light text-[#2C2C2C]">{f}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#B8926A]/5 border border-[#B8926A]/20 rounded-2xl p-5">
                  <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8926A] mb-3">Dogs Only</h3>
                  {DOG_ONLY.map((f) => (
                    <span key={f} className="text-sm font-light text-[#4B5563] block">{f}</span>
                  ))}
                </div>
                <div className="bg-[#C4A2B0]/5 border border-[#C4A2B0]/20 rounded-2xl p-5">
                  <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#C4A2B0] mb-3">Cats Only</h3>
                  {CAT_ONLY.map((f) => (
                    <span key={f} className="text-sm font-light text-[#4B5563] block">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source note */}
        <div className="text-center animate-fade-in-up delay-200">
          <p className="text-xs font-light text-[#9CA3AF] mb-8">
            This list was sourced via <a href="https://www.bluecross.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#8DA399] hover:underline">Blue Cross</a>
          </p>
          <Link to="/subscriptions">
            <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105" data-testid="safe-flowers-shop-btn">
              Shop Pet-Safe Bouquets <ArrowLeft size={14} className="ml-2 rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
