import { Heart, Leaf, ShieldCheck, PawPrint } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="about-page">
      <SEOHead title="About Us" description="Learn about Petal & Paw - our mission to make beautiful, pet-safe flowers accessible to every home." />
      <div className="container mx-auto px-5 md:px-8 max-w-4xl">

        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Our Story</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-4 sm:mb-6">
            About Petal & Paw
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#6B7280] max-w-2xl mx-auto">
            We believe every home deserves beautiful flowers — and every pet deserves to be safe around them. That's why we created Petal & Paw.
          </p>
        </div>

        <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-12 sm:mb-16 animate-fade-in-up delay-100">
          <img
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200"
            alt="Beautiful flowers in a bright, minimal home"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none mb-12 sm:mb-16 animate-fade-in-up delay-200">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">Our Mission</h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280]">
                Petal & Paw was born from a simple frustration: finding flowers that are both stunning and safe for our furry companions. We spent months researching, consulting with veterinarians, and sourcing the finest pet-safe blooms to create arrangements that bring joy without worry.
              </p>
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">What Makes Us Different</h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280]">
                Every single flower we sell has been carefully checked against scientific data to ensure it's non-toxic to cats, dogs, and other common household pets. We don't just avoid the obvious dangers — we go the extra mile to make sure your home is a safe haven for every member of your family.
              </p>
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">Sustainability</h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280]">
                We're committed to sustainable practices. Our packaging is 100% recyclable, our flowers are ethically sourced, and we partner with growers who share our values of responsible, environmentally-conscious farming.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up delay-300">
          {[
            { icon: ShieldCheck, label: "100% Pet Safe", desc: "Every stem verified" },
            { icon: Leaf, label: "Sustainable", desc: "Eco-friendly practices" },
            { icon: Heart, label: "Handcrafted", desc: "Arranged with care" },
            { icon: PawPrint, label: "Pet-Loving", desc: "By pet owners, for pet owners" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center p-4 sm:p-6 bg-white border border-[#E5E0D6] rounded-xl">
              <Icon size={24} strokeWidth={1.5} className="text-[#8DA399] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#2C2C2C] mb-1">{label}</h3>
              <p className="text-xs font-light text-[#6B7280]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
