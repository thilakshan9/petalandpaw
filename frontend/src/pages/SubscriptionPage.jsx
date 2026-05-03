import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, PawPrint, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SubscriptionPage() {
  const { customer, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [petToy, setPetToy] = useState({});
  const [emailDialog, setEmailDialog] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [preOrderExpanded, setPreOrderExpanded] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [personalizedMessage, setPersonalizedMessage] = useState("");
  const [guestDialog, setGuestDialog] = useState(null);
  const [petType, setPetType] = useState({});
  const [petTypeOther, setPetTypeOther] = useState({});
  const [orderCount, setOrderCount] = useState(0);
  const [stockLimit, setStockLimit] = useState(60);

  useEffect(() => {
    fetch(`${API}/subscriptions/plans`)
      .then((r) => r.json())
      .then((data) => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`${API}/subscriptions/order-count/all`)
      .then((r) => r.json())
      .then((data) => {
        setOrderCount(data.count || 0);
        setStockLimit(data.limit || 60);
      })
      .catch(() => {});
  }, []);

  // Auto-resume checkout after login
  useEffect(() => {
    if (authLoading || !customer || loading || plans.length === 0) return;
    const pending = localStorage.getItem("pp_pending_checkout");
    if (!pending) return;
    try {
      const data = JSON.parse(pending);
      localStorage.removeItem("pp_pending_checkout");
      // Restore state and go straight to email dialog
      if (data.petType) setPetType(prev => ({ ...prev, [data.planId]: data.petType }));
      if (data.petTypeOther) setPetTypeOther(prev => ({ ...prev, [data.planId]: data.petTypeOther }));
      if (data.petToy) setPetToy(prev => ({ ...prev, [data.planId]: data.petToy }));
      setOrderType(data.orderType);
      setEmailDialog(data.planId);
      setCustomerEmail(customer.email);
      setPersonalizedMessage("");
    } catch { localStorage.removeItem("pp_pending_checkout"); }
  }, [authLoading, customer, loading, plans]);

  const handleSubscribeClick = (planId, type = "subscription") => {
    const selectedPet = petType[planId] || "";
    if (!selectedPet) {
      toast.error("Please select your pet type first");
      return;
    }
    if (selectedPet === "other" && !(petTypeOther[planId] || "").trim()) {
      toast.error("Please enter your pet type");
      return;
    }
    setOrderType(type);
    if (!customer) {
      setGuestDialog(planId);
      return;
    }
    setEmailDialog(planId);
    setCustomerEmail(customer.email);
    setPersonalizedMessage("");
  };

  const handleGuestContinue = () => {
    const planId = guestDialog;
    setGuestDialog(null);
    setEmailDialog(planId);
    setCustomerEmail("");
    setPersonalizedMessage("");
  };

  const handleGuestLogin = () => {
    // Save pending purchase so we can resume after login
    const planId = guestDialog;
    localStorage.setItem("pp_pending_checkout", JSON.stringify({
      planId,
      orderType,
      petType: petType[planId] || "",
      petTypeOther: petTypeOther[planId] || "",
      petToy: !!petToy[planId],
    }));
    setGuestDialog(null);
    navigate("/login");
  };

  const handleSubscribe = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    const planId = emailDialog;
    setEmailDialog(null);
    setSubscribing(planId);
    try {
      const res = await fetch(`${API}/subscriptions/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          origin_url: window.location.origin,
          add_pet_toy: !!petToy[planId],
          customer_email: customerEmail,
          checkout_mode: orderType,
          personalized_message: personalizedMessage,
          pet_type: petType[planId] || "",
          pet_type_other: petTypeOther[planId] || "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.detail || "Something went wrong.");
        setSubscribing(null);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setSubscribing(null);
    }
  };

  // Progress bar: starts at 20% minimum, scales to 100% at stockLimit orders
  const progressPercent = Math.min(100, Math.max(55, (orderCount / stockLimit) * 100));
  const spotsLeft = Math.max(0, stockLimit - orderCount);

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="subscription-page">
      <SEOHead title="Subscriptions" description="Monthly pet-safe flower subscriptions. Three plans with optional pet toy add-on." keywords="flower subscription, monthly flowers, pet safe subscription" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Shop</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Shop
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Fresh, pet-safe flowers delivered monthly. Every bouquet is a surprise and changes with the seasons. Cancel anytime.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-white rounded-2xl p-8 h-[520px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {plans.map((plan, i) => {
              const isPop = plan.slug === "classic-bloom";
              const toyOn = !!petToy[plan.id];
              const toyPrice = plan.pet_toy_price || 8.99;
              const displayPrice = toyOn ? plan.price + toyPrice : plan.price;
              const selectedPet = petType[plan.id] || "";
              return (
                <div
                  key={plan.id}
                  className={`animate-fade-in-up bg-white border rounded-2xl p-5 sm:p-8 flex flex-col transition-all hover:-translate-y-1 ${
                    isPop ? "border-[#8DA399] ring-1 ring-[#8DA399]/20 relative" : "border-[#E5E0D6]"
                  }`}
                  style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                  data-testid={`plan-${plan.slug}`}
                >
                  {isPop && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8DA399] text-white text-[10px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div className="aspect-[4/5] rounded-xl overflow-hidden mb-6 bg-[#F2F0EB] relative">
                    <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover object-center scale-125" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-widest font-semibold text-[#2C2C2C] px-3 py-1 rounded-full">Last Month</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-light text-[#2C2C2C]">£{displayPrice.toFixed(2)}</span>
                    <span className="text-sm font-light text-[#6B7280]">/month</span>
                  </div>
                  {toyOn && <span className="text-xs text-[#8DA399] font-light mb-3">includes pet toy (+£{toyPrice.toFixed(2)})</span>}
                  <p className="text-sm font-light text-[#6B7280] mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features?.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-light text-[#4B5563]">
                        <Check size={14} className="text-[#8DA399] mt-0.5 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  {/* Pet Type Selector */}
                  <div className="mb-4" data-testid={`pet-type-section-${plan.slug}`}>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Your Pet</label>
                    <div className="relative">
                      <select
                        value={selectedPet}
                        onChange={(e) => setPetType({ ...petType, [plan.id]: e.target.value })}
                        className="w-full appearance-none border border-[#E5E0D6] rounded-lg px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399] pr-8"
                        data-testid={`pet-type-select-${plan.slug}`}
                      >
                        <option value="">Select pet...</option>
                        <option value="cat">Cat</option>
                        <option value="dog">Dog</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    </div>
                    {selectedPet === "other" && (
                      <Input
                        type="text"
                        placeholder="Enter your pet type..."
                        value={petTypeOther[plan.id] || ""}
                        onChange={(e) => setPetTypeOther({ ...petTypeOther, [plan.id]: e.target.value })}
                        className="mt-2 border-[#E5E0D6] text-sm"
                        data-testid={`pet-type-other-input-${plan.slug}`}
                      />
                    )}
                  </div>

                  {/* Pet Toy Add-on */}
                  <div className="flex items-center justify-between bg-[#F2F0EB]/60 rounded-xl px-4 py-3 mb-6" data-testid={`pet-toy-toggle-${plan.slug}`}>
                    <div className="flex items-center gap-2">
                      <PawPrint size={14} className="text-[#8DA399]" />
                      <span className="text-sm text-[#2C2C2C]">Add pet toy</span>
                      <span className="text-xs text-[#6B7280]">+£{toyPrice.toFixed(2)}</span>
                    </div>
                    <Switch
                      checked={toyOn}
                      onCheckedChange={(v) => setPetToy({ ...petToy, [plan.id]: v })}
                    />
                  </div>

                  {/* Buttons per plan type */}
                  {/* Subscribe / One-time buttons */}
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      onClick={() => handleSubscribeClick(plan.id, "subscription")}
                      disabled={subscribing === plan.id}
                      className="rounded-full px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90"
                      data-testid={`subscribe-${plan.slug}`}
                    >
                      {subscribing === plan.id ? "Processing..." : "Subscribe"} <ArrowRight size={14} className="ml-2" />
                    </Button>
                    <Button
                      onClick={() => handleSubscribeClick(plan.id, "one-time")}
                      disabled={subscribing === plan.id}
                      variant="outline"
                      className="rounded-full px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full border-[#8DA399] text-[#8DA399] hover:bg-[#8DA399] hover:text-white"
                      data-testid={`one-time-${plan.slug}`}
                    >
                      {subscribing === plan.id ? "Processing..." : "One-Time Purchase"} <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </div>
                  <p className="text-xs font-light text-[#6B7280] text-center mt-2" data-testid="order-deadline">Order by the 26th for this month's delivery</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Guest or Login Dialog */}
        <Dialog open={!!guestDialog} onOpenChange={(v) => { if (!v) setGuestDialog(null); }}>
          <DialogContent className="max-w-sm border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl" data-testid="guest-dialog">
            <DialogTitle className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Before You Continue</DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280]">
              Sign in to track your orders and manage subscriptions, or continue as a guest.
            </DialogDescription>
            <div className="mt-4 space-y-3">
              <Button
                onClick={handleGuestLogin}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full transition-all hover:scale-105"
                data-testid="guest-login-btn"
              >
                Sign In / Create Account <ArrowRight size={14} className="ml-2" />
              </Button>
              <Button
                onClick={handleGuestContinue}
                variant="outline"
                className="rounded-full border-[#E5E0D6] text-[#6B7280] hover:text-[#2C2C2C] hover:border-[#2C2C2C] px-8 py-6 text-xs uppercase tracking-widest w-full transition-all"
                data-testid="guest-continue-btn"
              >
                Continue as Guest
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={!!emailDialog} onOpenChange={(v) => { if (!v) setEmailDialog(null); }}>
          <DialogContent className="max-w-sm border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl" data-testid="email-dialog">
            <DialogTitle className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Your Email</DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280]">
              Enter your email to receive your {orderType === "one-time" ? "order" : "subscription"} confirmation and receipt.
            </DialogDescription>
            <div className="mt-4 space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="border-[#E5E0D6] text-sm py-5"
                data-testid="checkout-email-input"
                autoFocus
              />
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Add a gift note (optional)</label>
                <textarea
                  placeholder="Add a personal note to your bouquet..."
                  value={personalizedMessage}
                  onChange={(e) => setPersonalizedMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full border border-[#E5E0D6] rounded-md px-3 py-2 text-sm font-light text-[#2C2C2C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#8DA399] resize-none"
                  data-testid="personalized-message-input"
                />
                <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{personalizedMessage.length}/500</p>
              </div>
              <Button
                onClick={handleSubscribe}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full"
                data-testid="checkout-email-submit"
              >
                Continue to Payment <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
