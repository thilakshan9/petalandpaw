import { Heart, Leaf, ShieldCheck, PawPrint } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="about-page">
      <SEOHead title="About Us" description="The story behind Petal & Paw - beautiful flowers for homes with pets." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">

        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Our Story</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C]">
            About Petal & Paw
          </h1>
        </div>

        <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-12 sm:mb-16 animate-fade-in-up delay-100">
          <img
            src="https://lh3.googleusercontent.com/d/1Bb6vOtqJUPBQElYkHNqj8cAa4jnTIOIH=w1200"
            alt="Beautiful flowers in a bright, minimal home"
            className="w-full h-full object-cover object-[center_70%]"
          />
        </div>

        <div className="animate-fade-in-up delay-200 space-y-6 sm:space-y-8 mb-14 sm:mb-20">
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            Petal & Paw started on a random winter evening.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            I was feeling a bit low, wandered into my local supermarket, and picked up a bunch of flowers - no plan, just whatever looked pretty. When I got home, I pulled out every vase I owned and spent the evening arranging them, filling my living room with little bouquets.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            I'd never done anything like it before, but I loved it.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            It felt calm, creative, and honestly... like bringing a little bit of summer into a dark, cold day. And I couldn't stop thinking about it.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            At the same time, I was living with my cat and dog - my whole world. Not long after, I found out that a lot of common flowers are actually toxic to pets. Even if not always serious, they can cause irritation, upset stomachs, or breathing issues.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563] italic">
            I felt awful knowing I'd had them around my pets without realising.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            What surprised me most was how little this is talked about. I had no idea - and neither did most people I spoke to.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-medium leading-[1.9] text-[#2C2C2C]">
            And that didn't sit right with me.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            So Petal & Paw was born - a way to have beautiful flowers in your home, without the worry.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            Now, I personally select every stem and handcraft each bouquet, choosing flowers that are thoughtfully considered for homes with pets.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-light leading-[1.9] text-[#4B5563]">
            No guesswork. No Googling every bouquet. No stress.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-medium leading-[1.9] text-[#2C2C2C]">
            Just flowers that feel good, look good, and are made with a little more care.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up delay-300">
          {[
            { icon: ShieldCheck, label: "Pet Safe", desc: "Every stem verified" },
            { icon: Leaf, label: "Sustainable", desc: "Eco-friendly practices" },
            { icon: Heart, label: "Handcrafted", desc: "Arranged with care" },
            { icon: PawPrint, label: "Pet-Loving", desc: "By a pet owner, for pet owners" },
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
