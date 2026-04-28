import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const DOG_ONLY = ["Scabiosa"];
const CAT_ONLY = ["Trachelium"];
const BOTH = [
  "Astilbe", "Erica", "Freesia", "Gerbera Daisies", "Greenbell", "Lisianthus", "Limonium",
  "Olive", "Pitto", "Pussy Willow", "Rosemary", "Roses", "Snapdragons", "Statice",
  "Stock", "Veronica", "Sunflowers", "Waxflower"
];

export default function SafeFlowersPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="safe-flowers-page">
      <SEOHead title="Pet-Safe Flowers" description="A complete guide to flowers that are safe for cats and dogs. Sourced via Blue Cross." />
      <div className="container mx-auto px-5 md:px-8 max-w-4xl">

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Pet Safety</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Pet-Safe Flower Guide
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Every stem we use is carefully selected to be safe for your furry family members. Below is the full list of pet-friendly flowers we offer.
          </p>
        </div>

        <div className="space-y-8 animate-fade-in-up delay-100">

          {/* Safe for both */}
          <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
            <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-2">Safe for Both Cats & Dogs</h2>
            <p className="text-sm font-light text-[#6B7280] mb-5">You don't need to worry about your pets being near any of these stems.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5">
              {BOTH.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={14} className="text-[#8DA399] flex-shrink-0" />
                  <span className="text-sm font-light text-[#2C2C2C]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Dogs only */}
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
              <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-2">Safe for Dogs Only</h2>
              <p className="text-sm font-light text-[#6B7280] mb-5">These are additionally safe for dogs.</p>
              <div className="space-y-2.5">
                {DOG_ONLY.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-[#B8926A] flex-shrink-0" />
                    <span className="text-sm font-light text-[#2C2C2C]">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cats only */}
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
              <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-2">Safe for Cats Only</h2>
              <p className="text-sm font-light text-[#6B7280] mb-5">These are additionally safe for cats.</p>
              <div className="space-y-2.5">
                {CAT_ONLY.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-[#C4A2B0] flex-shrink-0" />
                    <span className="text-sm font-light text-[#2C2C2C]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Source note */}
        <div className="text-center mt-12 sm:mt-16 animate-fade-in-up delay-200">
          <p className="text-sm font-light text-[#6B7280]">
            This list was sourced via the <a href="https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants" target="_blank" rel="noopener noreferrer" className="text-[#8DA399] hover:underline">ASPCA</a>
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
