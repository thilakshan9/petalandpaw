import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

export default function ReturnsPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="returns-page">
      <SEOHead title="Returns" description="Petal & Paw returns policy for pet-safe flower orders." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">

        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Policy</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Returns
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            We want you to love your flowers. Here's what to do if something isn't right.
          </p>
        </div>

        <div className="animate-fade-in-up delay-100 space-y-8 sm:space-y-10">
          <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
            <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">Freshness Guarantee</h2>
            <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280]">
              Every bouquet is made fresh and shipped with care. If your flowers arrive damaged or wilted, please get in touch within 24 hours of delivery and we'll make it right - whether that's a replacement or a full refund.
            </p>
          </div>

          <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
            <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">How to Request a Return</h2>
            <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280] mb-4">
              Simply send us a photo of the flowers along with your order details. You can reach us via:
            </p>
            <ul className="space-y-2 text-sm sm:text-base font-light text-[#6B7280]">
              <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-1">-</span> Email: <a href="mailto:info@petalandpaw.co.uk" className="text-[#2C2C2C] hover:text-[#8DA399] transition-colors">info@petalandpaw.co.uk</a></li>
              <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-1">-</span> Instagram: <a href="https://instagram.com/petalandpawflorist" target="_blank" rel="noopener noreferrer" className="text-[#2C2C2C] hover:text-[#8DA399] transition-colors">@petalandpawflorist</a></li>
            </ul>
          </div>

          <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
            <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">Please Note</h2>
            <ul className="space-y-3 text-sm sm:text-base font-light leading-[1.8] text-[#6B7280]">
              <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-1">-</span> Due to the perishable nature of flowers, we can only accept claims within 24 hours of delivery.</li>
              <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-1">-</span> Slight variations in colour and arrangement are normal as every bouquet is handmade with seasonal stems.</li>
              <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-1">-</span> Subscription cancellations can be made anytime before your next billing date.</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center animate-fade-in-up delay-200">
          <p className="text-sm font-light text-[#6B7280] mb-5">Have a question? We're happy to help.</p>
          <Link to="/contact">
            <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105" data-testid="returns-contact-btn">
              Contact Us <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
