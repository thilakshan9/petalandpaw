import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Gift, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ReferralPage() {
  const { code } = useParams();
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (code) {
      fetch(`${API}/referral/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((r) => { if (r.ok) return r.json(); throw new Error(); })
        .then((data) => { setReferrer(data); setValid(true); })
        .catch(() => setValid(false))
        .finally(() => setLoading(false));
      // Save referral code for checkout
      localStorage.setItem("petal-paw-referral", code);
    } else {
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="py-12 sm:py-20 md:py-32" data-testid="referral-page">
      <SEOHead title="Referral" description="Get $10 off your first order at Petal & Paw." />
      <div className="container mx-auto px-5 md:px-8 max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-[#8DA399]/10 flex items-center justify-center mx-auto mb-6">
          <Gift size={28} className="text-[#8DA399]" />
        </div>

        {loading ? (
          <div className="animate-pulse text-[#6B7280] font-light tracking-widest text-sm uppercase">Checking referral...</div>
        ) : valid ? (
          <div className="animate-fade-in-up">
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4">
              You've been invited!
            </h1>
            <p className="text-base font-light text-[#6B7280] mb-2">
              {referrer?.referrer_name || "A friend"} thinks you'd love Petal & Paw.
            </p>
            <div className="bg-[#8DA399]/8 border border-[#8DA399]/20 rounded-xl p-6 my-8">
              <div className="flex items-center justify-center gap-2 text-[#8DA399] mb-2">
                <Check size={18} />
                <span className="text-lg font-semibold">$10 off your first order</span>
              </div>
              <p className="text-sm font-light text-[#6B7280]">
                Your referral code <span className="font-mono font-semibold text-[#2C2C2C]">{code}</span> will be automatically applied at checkout.
              </p>
            </div>
            <Link to="/shop">
              <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-10 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105" data-testid="referral-shop-btn">
                Start Shopping <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-4">Invalid Referral</h1>
            <p className="text-base font-light text-[#6B7280] mb-8">This referral code is not valid. You can still enjoy our pet-safe flowers!</p>
            <Link to="/shop">
              <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest" data-testid="referral-shop-btn">
                Browse Flowers
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
