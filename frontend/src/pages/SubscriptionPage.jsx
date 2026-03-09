import { useState, useEffect } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetch(`${API}/subscriptions/plans`)
      .then((r) => r.json())
      .then((data) => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const res = await fetch(`${API}/subscriptions/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubscribing(null);
    }
  };

  const frequencyLabel = { weekly: "/week", biweekly: "/2 weeks", monthly: "/month" };

  return (
    <div className="py-12 md:py-20" data-testid="subscription-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-3 block">Subscribe</span>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-4">
            Flower Subscriptions
          </h1>
          <p className="text-base md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Fresh, pet-safe flowers delivered on your schedule. Cancel anytime.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-8 h-[480px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`animate-fade-in-up delay-${(i + 1) * 100} bg-white border rounded-2xl p-8 flex flex-col transition-all hover:-translate-y-1 ${
                  i === 1 ? "border-[#8DA399] ring-1 ring-[#8DA399]/20 relative" : "border-[#E5E0D6]"
                }`}
                data-testid={`plan-${plan.frequency}`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8DA399] text-white text-[10px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-6 bg-[#F2F0EB]">
                  <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-light text-[#2C2C2C]">${plan.price.toFixed(2)}</span>
                  <span className="text-sm font-light text-[#6B7280]">{frequencyLabel[plan.frequency]}</span>
                </div>
                <p className="text-sm font-light text-[#6B7280] mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm font-light text-[#4B5563]">
                      <Check size={14} className="text-[#8DA399] mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  className={`rounded-full px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full ${
                    i === 1
                      ? "bg-[#8DA399] text-white hover:bg-[#8DA399]/90"
                      : "bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90"
                  }`}
                  data-testid={`subscribe-${plan.frequency}`}
                >
                  {subscribing === plan.id ? "Processing..." : "Subscribe"} <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
