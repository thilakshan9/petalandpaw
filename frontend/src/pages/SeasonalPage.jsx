import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin, ShoppingBag, Ghost, Moon, Sparkles, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/components/CartProvider";
import SEOHead from "@/components/SEOHead";
import { octoberWorkshops } from "@/lib/workshops";
import {
  isHalloweenActive,
  isOctoberDate,
  octoberRange,
  burstBats,
  HW,
  HW_BOUQUET_IMAGE,
  HW_BOUQUET_SIZES,
} from "@/lib/halloween";

export default function SeasonalPage() {
  const active = isHalloweenActive();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [size, setSize] = useState("medium");
  const [date, setDate] = useState("");
  const { min, max } = octoberRange();

  const selectedSize = HW_BOUQUET_SIZES.find((s) => s.id === size) || HW_BOUQUET_SIZES[1];
  const octoberWs = octoberWorkshops();

  // Bats fly in on load + when the visitor scrolls back to the top ("extra spooky").
  const lastBurst = useRef(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => burstBats(), 350);
    const onScroll = () => {
      if (window.scrollY < 60) {
        const now = Date.now();
        if (now - lastBurst.current > 4500) { lastBurst.current = now; burstBats(); }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, [active]);

  // Smooth-scroll to a workshop when arriving via /seasonal#ws-<id>
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2");
        setTimeout(() => el.classList.remove("ring-2"), 2200);
      }, 500);
    }
  }, [location.hash]);

  const buildItem = () => ({
    product_id: `halloween-bouquet-${size}`,
    name: `Halloween Bouquet \u2013 ${selectedSize.label}`,
    price: selectedSize.price,
    quantity: 1,
    image_url: HW_BOUQUET_IMAGE,
    halloween: true,
    hw_size: size,
    hw_delivery_date: date || "",
  });

  const validDate = () => {
    if (!date) return true; // optional here; can also be chosen at checkout
    return date >= min && date <= max;
  };

  const handleAdd = (goToCart) => {
    if (!validDate()) {
      toast.error("Please choose a delivery date in October.");
      return;
    }
    addToCart(buildItem());
    toast.success(`Halloween Bouquet (${selectedSize.label}) added to your basket`);
    if (goToCart) navigate("/cart");
  };

  // Gentle closed state for direct visitors outside October
  if (!active) {
    return (
      <div className="py-20 md:py-32" data-testid="seasonal-page-closed">
        <SEOHead title="Seasonal" description="Our seasonal Halloween collection returns every October." />
        <div className="container mx-auto px-5 md:px-8 max-w-xl text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F2F0EB] mb-6">
            <Moon size={28} strokeWidth={1.5} className="text-[#6B4E71]" />
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4">
            The spooky season is resting
          </h1>
          <p className="text-base font-light text-[#6B7280] mb-8">
            Our pet-safe Halloween collection blooms every October. Check back then for spooktacular bouquets and seasonal workshops.
          </p>
          <Link to="/subscriptions">
            <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest" data-testid="seasonal-closed-shop-btn">
              Shop our flowers <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="seasonal-page">
      <SEOHead title="Halloween Seasonal" description="Pet-safe Halloween bouquets and spooky-season flower workshops from Petal & Paw. Preorder now for any day in October." keywords="halloween flowers, pet safe halloween bouquet, spooky bouquet, october workshops" />

      {/* Spooky hero */}
      <section className="relative overflow-hidden" data-testid="seasonal-hero">
        <div
          className="relative"
          style={{ background: `radial-gradient(120% 90% at 50% -10%, ${HW.purple} 0%, ${HW.purpleDeep} 45%, ${HW.night} 100%)` }}
        >
          {/* fog + moon */}
          <div className="absolute inset-0 spooky-fog opacity-70 pointer-events-none" />
          <div className="absolute top-10 right-8 md:right-24 w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#F3E4C8] moon-glow pointer-events-none" />

          <div className="relative container mx-auto px-5 md:px-8 max-w-5xl py-24 sm:py-28 md:py-36 text-center">
            <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-[#E9D8C3] mb-4">
              <Ghost size={14} /> Petal &amp; Paw After Dark
            </span>
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#FAF9F6] mb-5 spooky-flicker">
              A Spooky Season in Bloom
            </h1>
            <p className="text-sm md:text-lg font-light text-[#FAF9F6]/80 max-w-xl mx-auto mb-8">
              Deliciously dark, always pet-safe. Preorder a Halloween bouquet for any day in October and join our spooky-season workshops.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => document.getElementById("hw-bouquet")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-full bg-[#D4956A] text-[#241B2B] hover:bg-[#e0a982] px-8 py-4 text-xs uppercase tracking-widest font-semibold transition-all hover:scale-105"
                data-testid="seasonal-shop-bouquet-btn"
              >
                Shop the bouquet <ArrowRight size={14} className="ml-2 inline" />
              </button>
              <button
                onClick={() => burstBats()}
                className="rounded-full border border-[#FAF9F6]/40 text-[#FAF9F6] hover:bg-[#FAF9F6]/10 px-8 py-4 text-xs uppercase tracking-widest transition-all"
                data-testid="seasonal-release-bats-btn"
              >
                Release the bats <Sparkles size={14} className="ml-2 inline" />
              </button>
            </div>
          </div>

          {/* bottom fade into page */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#FAF9F6] pointer-events-none" />
        </div>
      </section>

      <div className="container mx-auto px-5 md:px-8 max-w-6xl py-14 sm:py-20">
        {/* Halloween bouquet */}
        <section id="hw-bouquet" className="scroll-mt-24 mb-20 sm:mb-28 animate-fade-in-up" data-testid="hw-bouquet-section">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#6B4E71] mb-2 block">Preorder Now</span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">
              The Halloween Bouquet
            </h2>
            <p className="text-sm md:text-base font-light text-[#6B7280] max-w-xl mx-auto">
              A moody arrangement of pet-safe autumnal blooms in deep plums, dark oranges and inky tones. Choose your size and the October day you&apos;d like it to arrive.
            </p>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2" style={{ borderColor: HW.purpleBorder }}>
            {/* Image */}
            <div className="relative aspect-square md:aspect-auto md:min-h-[460px] bg-[#241B2B] overflow-hidden" data-testid="hw-bouquet-image">
              <img src={HW_BOUQUET_IMAGE} alt="Halloween pet-safe bouquet" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#241B2B]/80 backdrop-blur text-[#F3E4C8] text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full">
                <Leaf size={12} /> 100% Pet Safe
              </span>
            </div>

            {/* Configurator */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
              <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-1">Halloween Bouquet</h3>
              <p className="text-sm font-light text-[#6B7280] mb-6">Hand-tied fresh &middot; delivered across October</p>

              {/* Size selector */}
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Choose a size</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2" data-testid="hw-size-selector">
                {HW_BOUQUET_SIZES.map((s) => {
                  const on = size === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id)}
                      className="rounded-xl border px-2 py-3 text-center transition-all"
                      style={on
                        ? { borderColor: HW.purple, background: HW.purpleTint }
                        : { borderColor: "#E5E0D6", background: "#fff" }}
                      data-testid={`hw-size-${s.id}`}
                    >
                      <span className="block text-sm font-medium" style={{ color: on ? HW.purpleDeep : "#2C2C2C" }}>{s.label}</span>
                      <span className="block text-base font-light text-[#2C2C2C] mt-0.5">&pound;{s.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mb-6">{selectedSize.blurb}</p>

              {/* October delivery date */}
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Delivery date (October)</label>
              <input
                type="date"
                min={min}
                max={max}
                value={date}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && (v < min || v > max)) {
                    toast.error("Halloween bouquets can be delivered any day in October.");
                    return;
                  }
                  setDate(v);
                }}
                className="w-full border border-[#E5E0D6] rounded-lg px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#6B4E71] mb-1"
                data-testid="hw-delivery-date"
              />
              <p className="text-[11px] text-[#9CA3AF] mb-6">Pick any day in October. You can also set this later in your basket.</p>

              <div className="mt-auto space-y-2">
                <Button
                  onClick={() => handleAdd(true)}
                  className="w-full rounded-full px-8 py-6 text-xs uppercase tracking-widest text-[#241B2B] transition-all hover:scale-[1.02]"
                  style={{ background: HW.pumpkinSoft }}
                  data-testid="hw-buy-now-btn"
                >
                  Buy it now &mdash; &pound;{selectedSize.price.toFixed(2)} <ArrowRight size={14} className="ml-2" />
                </Button>
                <Button
                  onClick={() => handleAdd(false)}
                  variant="ghost"
                  className="w-full rounded-full px-6 py-5 text-xs uppercase tracking-widest text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F2F0EB]"
                  data-testid="hw-add-basket-btn"
                >
                  <ShoppingBag size={14} className="mr-2" /> Add to basket
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* October workshops */}
        <section className="animate-fade-in-up" data-testid="seasonal-workshops-section">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#6B4E71] mb-2 block">This October</span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">
              Spooky-Season Workshops
            </h2>
            <p className="text-sm md:text-base font-light text-[#6B7280] max-w-xl mx-auto">
              Gather your coven and arrange your own pet-safe blooms. Here are the sessions running this October.
            </p>
          </div>

          {octoberWs.length === 0 ? (
            <p className="text-center text-sm font-light text-[#6B7280]">More October dates coming soon &mdash; check the workshops page.</p>
          ) : (
            <div className="space-y-6">
              {octoberWs.map((w) => {
                const octDates = (w.upcomingDates || []).filter((d) => isOctoberDate(d.date));
                return (
                  <div
                    key={w.id}
                    id={`ws-${w.id}`}
                    className="scroll-mt-24 bg-white border rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 transition-all ring-[#6B4E71]"
                    style={{ borderColor: HW.purpleBorder }}
                    data-testid={`seasonal-workshop-${w.id}`}
                  >
                    <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-[#241B2B] overflow-hidden">
                      <img src={w.image} alt={w.place} className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 text-lg spooky-float">&#127875;</span>
                    </div>
                    <div className="p-5 sm:p-7 sm:col-span-2 flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-light mb-1" style={{ color: HW.purple }}>
                        <MapPin size={12} /> <span>{w.place}</span>
                      </div>
                      <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">{w.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {octDates.map((d, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: HW.purpleTint, color: HW.purpleDeep }}>
                            <Calendar size={12} /> {d.date}
                            <Clock size={12} className="ml-1" /> {d.time || w.time}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-light text-[#6B7280] mb-5 line-clamp-3">{w.description}</p>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <span className="text-lg font-light text-[#2C2C2C]">&pound;{w.price}<span className="text-xs text-[#6B7280]">/person</span></span>
                        {w.bookingType === "external" && w.bookingUrl ? (
                          <a href={w.bookingUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="rounded-full px-7 py-5 text-xs uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: HW.purple }} data-testid={`seasonal-book-${w.id}`}>
                              Book now <ArrowRight size={14} className="ml-2" />
                            </Button>
                          </a>
                        ) : (
                          <Button onClick={() => navigate("/workshops")} className="rounded-full px-7 py-5 text-xs uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: HW.purple }} data-testid={`seasonal-book-${w.id}`}>
                            Book now <ArrowRight size={14} className="ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/workshops" className="text-xs uppercase tracking-widest font-semibold text-[#6B4E71] hover:text-[#4A3550] transition-colors">
              See all workshops <ArrowRight size={14} className="ml-1 inline" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
