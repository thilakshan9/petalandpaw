import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin, ShoppingBag, Ghost, Moon, Sparkles, Leaf, TreePine, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/components/CartProvider";
import SEOHead from "@/components/SEOHead";
import Cobweb from "@/components/Cobweb";
import { WORKSHOPS } from "@/lib/workshops";
import {
  getActiveSeason,
  seasonConfig,
  isSeasonDate,
  seasonRange,
  burstBats,
  flurrySnow,
  HW,
  XMAS,
  HW_BOUQUET_IMAGE,
  HW_BOUQUET_SIZES,
  XMAS_WREATHS,
} from "@/lib/halloween";

// Small flickering candle used to warm up the Halloween hero.
function Candle({ className = "", style = {} }) {
  return (
    <div className={`relative ${className}`} style={style} aria-hidden="true">
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-6 w-10 h-10 rounded-full candle-halo"
        style={{ background: "radial-gradient(circle, rgba(212,149,106,0.85) 0%, rgba(212,149,106,0) 70%)" }}
      />
      <div
        className="candle-flame mx-auto"
        style={{ width: 8, height: 14, background: "radial-gradient(circle at 50% 65%, #FFE9A8 0%, #F0A83C 55%, #C97B3C 100%)", borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", boxShadow: "0 0 10px 2px rgba(240,168,60,0.6)" }}
      />
      <div className="mx-auto mt-0.5 rounded-sm" style={{ width: 7, height: 20, background: "linear-gradient(#F3E4C8,#E4CFA6)" }} />
    </div>
  );
}

export default function SeasonalPage() {
  const season = getActiveSeason();
  const cfg = seasonConfig(season);
  const isXmas = season === "christmas";
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  // Halloween bouquet state
  const [size, setSize] = useState("medium");
  // Shared seasonal delivery date (October or December)
  const [date, setDate] = useState("");
  const { min, max } = seasonRange(season || "halloween");

  const selectedSize = HW_BOUQUET_SIZES.find((s) => s.id === size) || HW_BOUQUET_SIZES[1];
  const seasonWs = WORKSHOPS
    .filter((w) => (w.upcomingDates || []).some((d) => isSeasonDate(d.date, season)))
    .sort((a, b) => {
      const ad = (a.upcomingDates || []).find((d) => isSeasonDate(d.date, season));
      const bd = (b.upcomingDates || []).find((d) => isSeasonDate(d.date, season));
      return new Date(ad.date) - new Date(bd.date);
    });

  // Trigger the season effect on load + when scrolling back to the top.
  const lastBurst = useRef(0);
  useEffect(() => {
    if (!season) return;
    const fire = () => (isXmas ? flurrySnow() : burstBats());
    const t = setTimeout(fire, 350);
    const onScroll = () => {
      if (window.scrollY < 60) {
        const now = Date.now();
        if (now - lastBurst.current > 4500) { lastBurst.current = now; fire(); }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, [season, isXmas]);

  // Smooth-scroll to a workshop when arriving via /seasonal#ws-<id>
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2");
        setTimeout(() => el.classList.remove("ring-2"), 2200);
      }, 500);
    }
  }, [location.hash]);

  const validDate = () => !date || (date >= min && date <= max);

  const addBouquet = (goToCart) => {
    if (!validDate()) { toast.error("Please choose a delivery date in October."); return; }
    addToCart({
      product_id: `halloween-bouquet-${size}`,
      name: `Halloween Bouquet \u2013 ${selectedSize.label}`,
      price: selectedSize.price,
      quantity: 1,
      image_url: HW_BOUQUET_IMAGE,
      theme: "halloween",
      season_date: date || "",
    });
    toast.success(`Halloween Bouquet (${selectedSize.label}) added to your basket`);
    if (goToCart) navigate("/cart");
  };

  const addWreath = (w, goToCart) => {
    if (!validDate()) { toast.error("Please choose a delivery date in December."); return; }
    addToCart({
      product_id: w.id,
      name: w.name,
      price: w.price,
      quantity: 1,
      image_url: w.seasonalImage || w.image,
      theme: "christmas",
      season_date: date || "",
    });
    toast.success(`${w.name} added to your basket`);
    if (goToCart) navigate("/cart");
  };

  // Closed state for direct visitors outside any season
  if (!season) {
    return (
      <div className="py-20 md:py-32" data-testid="seasonal-page-closed">
        <SEOHead title="Seasonal" description="Our seasonal collections return each Halloween and Christmas." />
        <div className="container mx-auto px-5 md:px-8 max-w-xl text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F2F0EB] mb-6">
            <Sparkles size={28} strokeWidth={1.5} className="text-[#8DA399]" />
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4">
            Our seasonal shop is resting
          </h1>
          <p className="text-base font-light text-[#6B7280] mb-8">
            Pop back each October for spooky Halloween blooms, and each December for our pet-safe Christmas wreath collection.
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

  const heroBg = isXmas
    ? `radial-gradient(120% 90% at 50% -10%, ${XMAS.green} 0%, ${XMAS.greenDeep} 45%, ${XMAS.night} 100%)`
    : `radial-gradient(120% 90% at 50% -10%, ${HW.purple} 0%, ${HW.purpleDeep} 45%, ${HW.night} 100%)`;

  return (
    <div data-testid="seasonal-page" data-season={season}>
      <SEOHead
        title={isXmas ? "Christmas Seasonal" : "Halloween Seasonal"}
        description={isXmas
          ? "Pet-safe Christmas wreaths and festive flower workshops from Petal & Paw. Order now for any day in December."
          : "Pet-safe Halloween bouquets and spooky-season flower workshops from Petal & Paw. Preorder now for any day in October."}
      />

      {/* Seasonal hero */}
      <section className="relative overflow-hidden" data-testid="seasonal-hero">
        <div className="relative" style={{ background: heroBg }}>
          {/* Halloween-only cobweb corners + candles */}
          {!isXmas && (
            <>
              <Cobweb className="cobweb" size={140} style={{ top: 0, left: 0 }} />
              <Cobweb className="cobweb" size={140} flip style={{ top: 0, right: 0 }} />
            </>
          )}

          <div className="relative container mx-auto px-5 md:px-8 max-w-5xl py-24 sm:py-28 md:py-36 text-center">
            <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-[#E9D8C3] mb-4">
              {isXmas ? <TreePine size={14} /> : <Ghost size={14} />} {cfg.heroKicker}
            </span>
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#FAF9F6] mb-5">
              {cfg.heroTitle}
            </h1>
            <p className="text-sm md:text-lg font-light text-[#FAF9F6]/80 max-w-xl mx-auto mb-8">
              {cfg.heroBlurb}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => document.getElementById("season-collection")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-full px-8 py-4 text-xs uppercase tracking-widest font-semibold transition-all hover:scale-105"
                style={{ background: isXmas ? XMAS.goldSoft : HW.pumpkinSoft, color: isXmas ? XMAS.greenDeep : "#241B2B" }}
                data-testid="seasonal-shop-collection-btn"
              >
                {isXmas ? "Shop the wreaths" : "Shop the bouquet"} <ArrowRight size={14} className="ml-2 inline" />
              </button>
              <button
                onClick={() => document.getElementById("seasonal-workshops")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-full border border-[#FAF9F6]/40 text-[#FAF9F6] hover:bg-[#FAF9F6]/10 px-8 py-4 text-xs uppercase tracking-widest font-semibold transition-all inline-flex items-center"
                data-testid="seasonal-explore-workshops-btn"
              >
                Explore workshops <ArrowRight size={14} className="ml-2 inline" />
              </button>
              <button
                onClick={() => (isXmas ? flurrySnow() : burstBats())}
                className="rounded-full border border-[#FAF9F6]/40 text-[#FAF9F6] hover:bg-[#FAF9F6]/10 px-8 py-4 text-xs uppercase tracking-widest transition-all"
                data-testid="seasonal-effect-btn"
              >
                {isXmas ? <>Let it snow <Snowflake size={14} className="ml-2 inline" /></> : <>Release the bats <Sparkles size={14} className="ml-2 inline" /></>}
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#FAF9F6] pointer-events-none" />
        </div>
      </section>

      <div className="container mx-auto px-5 md:px-8 max-w-6xl py-14 sm:py-20">
        {/* Collection */}
        <section id="season-collection" className="scroll-mt-24 mb-20 sm:mb-28 animate-fade-in-up" data-testid="season-collection-section">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold mb-2 block" style={{ color: isXmas ? XMAS.green : HW.purple }}>{cfg.collectionKicker}</span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">
              {cfg.collectionTitle}
            </h2>
            <p className="text-sm md:text-base font-light text-[#6B7280] max-w-xl mx-auto">{cfg.collectionBlurb}</p>
          </div>

          {/* Shared delivery date */}
          <div className="max-w-md mx-auto mb-8">
            <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block text-center">
              Delivery date ({isXmas ? "December" : "October"})
            </label>
            <input
              type="date"
              min={min}
              max={max}
              value={date}
              onChange={(e) => {
                const v = e.target.value;
                if (v && (v < min || v > max)) {
                  toast.error(`Please choose a day in ${isXmas ? "December" : "October"}.`);
                  return;
                }
                setDate(v);
              }}
              className="w-full border border-[#E5E0D6] rounded-lg px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 mb-1"
              style={{ ["--tw-ring-color"]: isXmas ? XMAS.green : HW.purple }}
              data-testid="season-delivery-date"
            />
            <p className="text-[11px] text-[#9CA3AF] text-center">Pick any day in {isXmas ? "December" : "October"}. You can also set this later in your basket.</p>
          </div>

          {isXmas ? (
            /* Christmas wreath collection grid */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6" data-testid="xmas-wreath-grid">
              {XMAS_WREATHS.map((w) => (
                <div key={w.id} className="bg-white border rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1" style={{ borderColor: XMAS.greenBorder }} data-testid={`wreath-${w.id}`}>
                  <div className="relative aspect-square bg-[#122019] overflow-hidden">
                    <img src={w.seasonalImage || w.image} alt={w.name} className="absolute inset-0 w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-[#122019]/80 backdrop-blur text-[#E3C77E] text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full">
                      <Leaf size={12} /> Pet Safe
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-1">{w.name}</h3>
                    <p className="text-sm font-light text-[#6B7280] mb-3 flex-1">{w.blurb}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-light text-[#2C2C2C]">&pound;{w.price.toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={() => addWreath(w, true)}
                      className="w-full rounded-full px-6 py-5 text-xs uppercase tracking-widest text-[#122019] transition-all hover:scale-[1.02] mb-1.5"
                      style={{ background: XMAS.goldSoft }}
                      data-testid={`wreath-buy-${w.id}`}
                    >
                      Buy it now <ArrowRight size={14} className="ml-2" />
                    </Button>
                    <Button
                      onClick={() => addWreath(w, false)}
                      variant="ghost"
                      className="w-full rounded-full px-6 py-4 text-xs uppercase tracking-widest text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F2F0EB]"
                      data-testid={`wreath-add-${w.id}`}
                    >
                      <ShoppingBag size={14} className="mr-2" /> Add to basket
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Halloween bouquet */
            <div className="bg-white border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2" style={{ borderColor: HW.purpleBorder }}>
              <div className="relative aspect-square md:aspect-auto md:min-h-[460px] bg-[#241B2B] overflow-hidden" data-testid="hw-bouquet-image">
                <img src={HW_BOUQUET_IMAGE} alt="Halloween pet-safe bouquet" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#241B2B]/80 backdrop-blur text-[#F3E4C8] text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full">
                  <Leaf size={12} /> Pet Safe
                </span>
              </div>
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col relative">
                <Cobweb size={90} style={{ top: 4, right: 4, position: "absolute", opacity: 0.5 }} />
                <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-1">Halloween Bouquet</h3>
                <p className="text-sm font-light text-[#6B7280] mb-6">Hand-tied fresh &middot; delivered across October</p>

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
                        style={on ? { borderColor: HW.purple, background: HW.purpleTint } : { borderColor: "#E5E0D6", background: "#fff" }}
                        data-testid={`hw-size-${s.id}`}
                      >
                        <span className="block text-sm font-medium" style={{ color: on ? HW.purpleDeep : "#2C2C2C" }}>{s.label}</span>
                        <span className="block text-base font-light text-[#2C2C2C] mt-0.5">&pound;{s.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#9CA3AF] mb-6">{selectedSize.blurb}</p>

                <div className="mt-auto space-y-2">
                  <Button
                    onClick={() => addBouquet(true)}
                    className="w-full rounded-full px-8 py-6 text-xs uppercase tracking-widest text-[#241B2B] transition-all hover:scale-[1.02]"
                    style={{ background: HW.pumpkinSoft }}
                    data-testid="hw-buy-now-btn"
                  >
                    Buy it now &middot; &pound;{selectedSize.price.toFixed(2)} <ArrowRight size={14} className="ml-2" />
                  </Button>
                  <Button
                    onClick={() => addBouquet(false)}
                    variant="ghost"
                    className="w-full rounded-full px-6 py-5 text-xs uppercase tracking-widest text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F2F0EB]"
                    data-testid="hw-add-basket-btn"
                  >
                    <ShoppingBag size={14} className="mr-2" /> Add to basket
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Seasonal workshops */}
        <section id="seasonal-workshops" className="scroll-mt-24 animate-fade-in-up" data-testid="seasonal-workshops-section">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold mb-2 block" style={{ color: isXmas ? XMAS.green : HW.purple }}>
              This {isXmas ? "December" : "October"}
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">
              {isXmas ? "Festive Workshops" : "Spooky-Season Workshops"}
            </h2>
            <p className="text-sm md:text-base font-light text-[#6B7280] max-w-xl mx-auto">
              {isXmas
                ? "Gather your friends and make your own pet-safe festive arrangements. Here are the sessions running this December."
                : "Gather your coven and arrange your own pet-safe blooms. Here are the sessions running this October."}
            </p>
          </div>

          {seasonWs.length === 0 ? (
            <p className="text-center text-sm font-light text-[#6B7280]">
              More {isXmas ? "December" : "October"} dates coming soon. See all our <Link to="/workshops" className="underline hover:no-underline" style={{ color: isXmas ? XMAS.green : HW.purple }}>workshops</Link>.
            </p>
          ) : (
            <div className="space-y-6">
              {seasonWs.map((w) => {
                const accent = isXmas ? XMAS : HW;
                const dates = (w.upcomingDates || []).filter((d) => isSeasonDate(d.date, season));
                return (
                  <div
                    key={w.id}
                    id={`ws-${w.id}`}
                    className="scroll-mt-24 bg-white border rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 transition-all"
                    style={{ borderColor: isXmas ? XMAS.greenBorder : HW.purpleBorder }}
                    data-testid={`seasonal-workshop-${w.id}`}
                  >
                    <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-[#122019] overflow-hidden">
                      <img src={w.seasonalImage || w.image} alt={w.place} className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 text-lg spooky-float">{isXmas ? "\u2744\uFE0F" : "\uD83C\uDF83"}</span>
                    </div>
                    <div className="p-5 sm:p-7 sm:col-span-2 flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-light mb-1" style={{ color: accent.green || accent.purple }}>
                        <MapPin size={12} /> <span>{w.place}</span>
                      </div>
                      <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">{w.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dates.map((d, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: isXmas ? XMAS.greenTint : HW.purpleTint, color: isXmas ? XMAS.greenDeep : HW.purpleDeep }}>
                            <Calendar size={12} /> {d.date}
                            <Clock size={12} className="ml-1" /> {d.time || w.time}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-light text-[#6B7280] mb-5">{w.description}</p>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <span className="text-lg font-light text-[#2C2C2C]">&pound;{w.price}<span className="text-xs text-[#6B7280]">/person</span></span>
                        {w.bookingType === "external" && w.bookingUrl ? (
                          <a href={w.bookingUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="rounded-full px-7 py-5 text-xs uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: isXmas ? XMAS.green : HW.purple }} data-testid={`seasonal-book-${w.id}`}>
                              Book now <ArrowRight size={14} className="ml-2" />
                            </Button>
                          </a>
                        ) : (
                          <Button onClick={() => navigate("/workshops")} className="rounded-full px-7 py-5 text-xs uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: isXmas ? XMAS.green : HW.purple }} data-testid={`seasonal-book-${w.id}`}>
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
            <Link to="/workshops" className="text-xs uppercase tracking-widest font-semibold transition-colors" style={{ color: isXmas ? XMAS.green : HW.purple }}>
              See all workshops <ArrowRight size={14} className="ml-1 inline" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
