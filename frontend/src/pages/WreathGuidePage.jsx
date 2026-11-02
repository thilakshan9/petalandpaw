import SEOHead from "@/components/SEOHead";

export default function WreathGuidePage() {
  return (
    <div className="py-20 sm:py-28 md:py-36 text-center" data-testid="wreath-guide-page">
      <SEOHead title="How to Create a Wreath" description="A step-by-step guide to making your own wreath." />
      <div className="container mx-auto px-5 md:px-8 max-w-xl animate-fade-in-up">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 block">Guide</span>
        <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4">
          How to Create a Wreath
        </h1>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280]">
          Coming soon. We are putting together a step-by-step guide to making your own wreath.
        </p>
      </div>
    </div>
  );
}
