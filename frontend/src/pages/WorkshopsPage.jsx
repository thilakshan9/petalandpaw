import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const WORKSHOPS = [
  {
    id: 1,
    name: "Flower Arranging Workshop",
    place: "King's Dog Daycare",
    date: "30 May 2026",
    time: "1pm - 2:30pm",
    price: 35,
    description: "Relax with dogs and enjoy a creative afternoon of flower arranging. Whether you're a complete beginner or just looking for something different, this laid-back workshop is for you. Bring your furry friend along and make something beautiful together. All levels welcome - come meet like-minded people and leave with a gorgeous bouquet.",
    included: ["Your bouquet to take home", "x1 drink included", "Doggy treat cup if you bring a furry friend"],
    accent: "#B8926A",
  },
  {
    id: 2,
    name: "Flower Arranging Workshop",
    place: "Cat-titude Cat Cafe",
    date: "19 June 2026",
    time: "6pm - 7pm",
    price: 35,
    description: "Enjoy a creative evening surrounded by cats at the cosiest cafe in town. Unwind after work, learn to arrange a beautiful pet-safe bouquet, and soak up the calm vibes. All levels welcome - no experience needed, just come ready to relax and meet like-minded people.",
    included: ["Your bouquet to take home", "Prosecco (+£10 add-on)"],
    accent: "#C4A2B0",
  },
];

export default function WorkshopsPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="workshops-page">
      <SEOHead title="Workshops" description="Join our flower arranging workshops. Create your own pet-safe bouquet in a fun, relaxed setting." />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">

        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Workshops</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Upcoming Workshops
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Learn to arrange beautiful, pet-safe flowers in a fun and relaxed setting. No experience needed - just come ready to create.
          </p>
        </div>

        <div className="space-y-8 animate-fade-in-up delay-100">
          {WORKSHOPS.map((w) => (
            <div key={w.id} className="bg-white border border-[#E5E0D6] rounded-2xl overflow-hidden" data-testid={`workshop-${w.id}`}>
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-1">{w.name}</h2>
                    <div className="flex items-center gap-1.5 text-sm font-light" style={{ color: w.accent }}>
                      <MapPin size={14} />
                      <span>{w.place}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-2xl font-light text-[#2C2C2C]">£{w.price}</span>
                    <span className="text-sm font-light text-[#6B7280]">/person</span>
                  </div>
                </div>

                {/* Date & Time Cards */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-2 bg-[#F2F0EB] rounded-full px-4 py-2">
                    <Calendar size={14} className="text-[#8DA399]" />
                    <span className="text-sm font-light text-[#2C2C2C]">{w.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F2F0EB] rounded-full px-4 py-2">
                    <Clock size={14} className="text-[#8DA399]" />
                    <span className="text-sm font-light text-[#2C2C2C]">{w.time}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280] mb-6">{w.description}</p>

                {/* What's Included */}
                <div className="bg-[#F2F0EB]/60 rounded-xl p-5 mb-6">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-3">What's Included</h3>
                  <ul className="space-y-2">
                    {w.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-light text-[#4B5563]">
                        <Gift size={14} className="text-[#8DA399] mt-0.5 flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link to="/contact">
                  <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105" data-testid={`book-workshop-${w.id}`}>
                    Enquire to Book <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
