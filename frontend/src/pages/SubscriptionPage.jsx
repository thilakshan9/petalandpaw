import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, PawPrint, ChevronDown, ShoppingBag, Sparkles, Loader as Loader2, CircleCheck as CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/components/CartProvider";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SubscriptionPage() {
  const { customer, loading: authLoading } = useCustomerAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [petToy, setPetToy] = useState({});
  const [emailDialog, setEmailDialog] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderType, setOrderType] = useState(null);
  const [purchaseMode, setPurchaseMode] = useState({});
  const [personalizedMessage, setPersonalizedMessage] = useState("");
  const [guestDialog, setGuestDialog] = useState(null);
  const [petType, setPetType] = useState({});
  const [petTypeOther, setPetTypeOther] = useState({});
  const [deliveryDate, setDeliveryDate] = useState({});
  const [orderCount, setOrderCount] = useState(0);
  const [stockLimit, setStockLimit] = useState(60);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    bouquet_style: "",
    pet_type: "",
    occasion: "",
    preferred_date: "",
    full_name: "",
    email: "",
    notes: "",
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

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

  // Check if user returned from Stripe without completing - add item to basket
  useEffect(() => {
    const pendingItem = localStorage.getItem("pp_pending_stripe_item");
    if (!pendingItem) return;
    try {
      const item = JSON.parse(pendingItem);
      localStorage.removeItem("pp_pending_stripe_item");
      addToCart(item);
      toast.info("Your item has been added to your basket");
    } catch { localStorage.removeItem("pp_pending_stripe_item"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Enforce 3-day minimum on preferred delivery date (mobile Safari ignores HTML5 min)
    const dDate = deliveryDate[planId];
    if (type === "one-time" && !dDate) {
      toast.error("Please choose your preferred delivery date.");
      return;
    }
    if (dDate) {
      const picked = new Date(dDate + "T00:00:00");
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(minDate.getDate() + 3);
      if (picked < minDate) {
        toast.error("Please choose a delivery date at least 3 days from today.");
        return;
      }
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
          delivery_date: orderType === "one-time" ? deliveryDate[planId] || "" : "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        // Save to basket before redirecting - if they don't complete Stripe, it'll be in their basket
        const plan = plans.find(p => p.id === planId);
        if (plan) {
          const toyOn = !!petToy[planId];
          const toyPrice = plan.pet_toy_price || 8.99;
          const basePrice = orderType === "subscription" ? plan.price * 0.9 : plan.price;
          const price = toyOn ? basePrice + toyPrice : basePrice;
          const cartItem = {
            product_id: planId,
            name: plan.name + (toyOn ? " + Pet Toy" : ""),
            price,
            quantity: 1,
            image_url: plan.image_url,
            plan_slug: plan.slug,
            order_type: orderType,
            pet_type: (petType[planId] === "other" ? petTypeOther[planId] : petType[planId]) || "",
            add_pet_toy: toyOn,
          };
          localStorage.setItem("pp_pending_stripe_item", JSON.stringify(cartItem));
        }
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

  const openRequestDialog = () => {
    setRequestForm({
      bouquet_style: "",
      pet_type: "",
      occasion: "",
      preferred_date: "",
      full_name: customer?.name || "",
      email: customer?.email || "",
      notes: "",
    });
    setRequestError("");
    setRequestSuccess(false);
    setRequestOpen(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    const f = requestForm;
    if (!f.bouquet_style || !f.pet_type || !f.full_name.trim() || !f.email.trim()) {
      setRequestError("Please fill in the required fields.");
      return;
    }
    setRequestSubmitting(true);
    setRequestError("");
    const message = [
      `Bouquet style: ${f.bouquet_style}`,
      `Pet type: ${f.pet_type}`,
      f.occasion.trim() ? `Occasion: ${f.occasion.trim()}` : null,
      f.preferred_date ? `Preferred date: ${f.preferred_date}` : null,
      "",
      f.notes ? `Additional notes:\n${f.notes.trim()}` : null,
    ].filter(Boolean).join("\n");
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.full_name.trim(),
          email: f.email.trim(),
          subject: `Bespoke Bouquet Request - ${f.bouquet_style}`,
          message,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Unable to send your request. Please try again.");
      }
      setRequestSuccess(true);
    } catch (err) {
      setRequestError(err.message || "Something went wrong. Please try again.");
    }
    setRequestSubmitting(false);
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
          <p className="text-base md:text-xl font-light text-[#2C2C2C] max-w-2xl mx-auto mb-3">
            Luxury pet-safe bouquets delivered to your door. Safe for curious cats and dogs, beautifully arranged and always seasonal
          </p>
        </div>

        <div className="mb-12 sm:mb-16 animate-fade-in-up delay-50" data-testid="request-bouquet-hero">
          <div className="relative bg-white border border-[#E5E0D6] rounded-2xl px-6 py-7 sm:px-10 sm:py-9 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#C4A2B0]/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-[#8DA399]/10 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-11 h-11 flex-shrink-0 rounded-full bg-[#C4A2B0]/15 flex items-center justify-center">
                  <Sparkles size={18} strokeWidth={1.5} className="text-[#C4A2B0]" />
                </div>
                <span className="md:hidden text-[10px] uppercase tracking-[0.3em] font-semibold text-[#C4A2B0]">Bespoke Bouquets</span>
              </div>
              <div className="flex-1">
                <span className="hidden md:block text-[10px] uppercase tracking-[0.3em] font-semibold text-[#C4A2B0] mb-1.5">Bespoke Bouquets</span>
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-2 leading-tight">
                  Looking for something truly bespoke?
                  <br />
                  We'll create a bouquet just for you.
                </h2>
                <p className="text-sm font-light text-[#6B7280] leading-relaxed">
                  Tell us your preferred style, colour palette, occasion and any special requests, and we'll create a beautiful seasonal arrangement tailored to you.
                </p>
              </div>
              <Button
                onClick={openRequestDialog}
                className="rounded-full bg-[#C4A2B0] text-white hover:bg-[#C4A2B0]/90 px-7 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105 flex-shrink-0 self-stretch md:self-auto"
                data-testid="request-bouquet-hero-btn"
              >
                Request a bouquet <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
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
              const selectedMode = purchaseMode[plan.id] || "subscription";
              const oneTimePrice = plan.price;
              const subscriptionPrice = plan.price * 0.9;
              const displayBasePrice = selectedMode === "subscription" ? subscriptionPrice : oneTimePrice;
              const displayPrice = toyOn ? displayBasePrice + toyPrice : displayBasePrice;
              const selectedPet = petType[plan.id] || "";
              const planName = isPop ? "Signature Selection" : plan.name;
              const planDescription = isPop
                ? "Our most popular bouquet, handcrafted using seasonal pet-safe flowers and delivered fresh to your door every month."
                : plan.description;
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
                    <img src={plan.image_url} alt={planName} className="w-full h-full object-cover object-center scale-125" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-widest font-semibold text-[#2C2C2C] px-3 py-1 rounded-full">Last Month</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">{planName}</h3>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                    {selectedMode === "subscription" && (
                      <span className="text-sm font-light text-[#9CA3AF] line-through">£{(toyOn ? oneTimePrice + toyPrice : oneTimePrice).toFixed(2)}</span>
                    )}
                    <span className="text-3xl font-light text-[#2C2C2C]">£{displayPrice.toFixed(2)}</span>
                    <span className="text-sm font-light text-[#6B7280]">{selectedMode === "subscription" ? "/month" : "one-time"}</span>
                  </div>
                  {selectedMode === "subscription" && <span className="text-xs text-[#8DA399] font-light mb-1">Save 10% with a subscription</span>}
                  {toyOn && <span className="text-xs text-[#8DA399] font-light mb-3">includes pet toy (+£{toyPrice.toFixed(2)})</span>}
                  <p className="text-sm font-light text-[#6B7280] mb-6">{planDescription}</p>

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
                        <option value="n/a">Petless</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    </div>
                    {selectedPet === "other" && (
                      <Input
                        type="text"
                        placeholder="Please specify..."
                        value={petTypeOther[plan.id] || ""}
                        onChange={(e) => setPetTypeOther({ ...petTypeOther, [plan.id]: e.target.value })}
                        className="mt-2 border-[#E5E0D6] text-sm"
                        data-testid={`pet-type-other-input-${plan.slug}`}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 rounded-full bg-[#F2F0EB] p-1 mb-4" data-testid={`purchase-toggle-${plan.slug}`}>
                    <button
                      type="button"
                      onClick={() => setPurchaseMode({ ...purchaseMode, [plan.id]: "subscription" })}
                      className={`rounded-full px-3 py-2 text-[10px] sm:text-xs uppercase tracking-widest transition-colors ${
                        selectedMode === "subscription" ? "bg-white text-[#2C2C2C] shadow-sm" : "text-[#6B7280]"
                      }`}
                      data-testid={`mode-subscription-${plan.slug}`}
                    >
                      Subscribe
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurchaseMode({ ...purchaseMode, [plan.id]: "one-time" })}
                      className={`rounded-full px-3 py-2 text-[10px] sm:text-xs uppercase tracking-widest transition-colors ${
                        selectedMode === "one-time" ? "bg-white text-[#2C2C2C] shadow-sm" : "text-[#6B7280]"
                      }`}
                      data-testid={`mode-one-time-${plan.slug}`}
                    >
                      One-Time
                    </button>
                  </div>

                  {selectedMode === "subscription" ? (
                    <p className="text-xs font-light text-[#6B7280] mb-4" data-testid={`subscription-note-${plan.slug}`}>
                      Subscriptions are delivered at the end of every month. <span className="text-[#8DA399]">Cancel anytime.</span>
                    </p>
                  ) : (
                    <div className="mb-4" data-testid={`delivery-date-${plan.slug}`}>
                      <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Preferred Delivery Date</label>
                      <input
                        type="date"
                        value={deliveryDate[plan.id] || ""}
                        min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) { setDeliveryDate({ ...deliveryDate, [plan.id]: "" }); return; }
                          // Mobile Safari ignores `min`, so re-validate here
                          const picked = new Date(v + "T00:00:00");
                          const minDate = new Date();
                          minDate.setHours(0, 0, 0, 0);
                          minDate.setDate(minDate.getDate() + 3);
                          if (picked < minDate) {
                            toast.error("Please choose a date at least 3 days from today.");
                            setDeliveryDate({ ...deliveryDate, [plan.id]: "" });
                            return;
                          }
                          setDeliveryDate({ ...deliveryDate, [plan.id]: v });
                        }}
                        className="w-full border border-[#E5E0D6] rounded-lg px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399]"
                        data-testid={`delivery-date-input-${plan.slug}`}
                      />
                      <p className="text-[10px] text-[#9CA3AF] mt-1">One-time orders are delivered on your chosen date. Minimum 3 days notice required.</p>
                    </div>
                  )}

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

                  <Button
                    onClick={() => handleSubscribeClick(plan.id, selectedMode)}
                    disabled={subscribing === plan.id}
                    className="rounded-full px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90"
                    data-testid={selectedMode === "subscription" ? `subscribe-${plan.slug}` : `one-time-${plan.slug}`}
                  >
                    {subscribing === plan.id ? "Processing..." : selectedMode === "subscription" ? "Subscribe & Save" : "One-Time Purchase"} <ArrowRight size={14} className="ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      const selectedPet = petType[plan.id] || "";
                      if (!selectedPet) { toast.error("Please select your pet type first"); return; }
                      if (selectedPet === "other" && !(petTypeOther[plan.id] || "").trim()) { toast.error("Please enter your pet type"); return; }
                      addToCart({
                        product_id: plan.id,
                        name: planName + (toyOn ? " + Pet Toy" : ""),
                        price: toyOn ? oneTimePrice + toyPrice : oneTimePrice,
                        quantity: 1,
                        image_url: plan.image_url,
                        plan_slug: plan.slug,
                        pet_type: selectedPet === "other" ? petTypeOther[plan.id] : selectedPet,
                        add_pet_toy: toyOn,
                      });
                      toast.success(`${planName} added to basket`);
                    }}
                    variant="ghost"
                    className="rounded-full px-6 py-5 text-xs uppercase tracking-widest w-full text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F2F0EB] mt-2"
                    data-testid={`add-to-basket-${plan.slug}`}
                  >
                    <ShoppingBag size={14} className="mr-2" /> Add to Basket
                  </Button>
                  <p className="text-xs font-light text-[#6B7280] text-center mt-2" data-testid="order-deadline">
                    {selectedMode === "subscription" ? "Cancel anytime" : "Order by the 26th for this month's delivery"}
                  </p>
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

        <Dialog open={requestOpen} onOpenChange={(open) => !requestSubmitting && setRequestOpen(open)}>
          <DialogContent className="bg-[#FAF9F6] max-w-md max-h-[90vh] overflow-y-auto" data-testid="request-bouquet-dialog">
            <DialogHeader>
              <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium">
                Request a bespoke bouquet
              </DialogTitle>
              <DialogDescription className="text-sm font-light text-[#6B7280] pt-1">
                Share the mood, pet, and occasion you have in mind and we'll come back with a seasonal, pet-safe bouquet suggestion.
              </DialogDescription>
            </DialogHeader>

            {requestSuccess ? (
              <div className="text-center py-6 animate-fade-in-up" data-testid="request-bouquet-success">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#8DA399]/15 mb-4">
                  <CheckCircle2 size={28} strokeWidth={1.5} className="text-[#8DA399]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-2">Request received</h3>
                <p className="text-sm font-light text-[#6B7280] mb-6">
                  Thanks {requestForm.full_name.split(" ")[0] || "lovely"}, we'll be in touch within 2 working days with something beautifully pet-safe.
                </p>
                <Button
                  onClick={() => setRequestOpen(false)}
                  className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-5 text-xs uppercase tracking-widest"
                  data-testid="request-bouquet-close-btn"
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="rb-style" className="text-xs uppercase tracking-widest text-[#6B7280]">Bouquet style</Label>
                  <select
                    id="rb-style"
                    value={requestForm.bouquet_style}
                    onChange={(e) => setRequestForm({ ...requestForm, bouquet_style: e.target.value })}
                    className="mt-1.5 w-full appearance-none border border-[#E5E0D6] rounded-md px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399]"
                    required
                    data-testid="request-bouquet-style"
                  >
                    <option value="">Select bouquet style...</option>
                    <option value="Soft and romantic">Soft and romantic</option>
                    <option value="Bright and joyful">Bright and joyful</option>
                    <option value="Seasonal surprise">Seasonal surprise</option>
                    <option value="Minimal and elegant">Minimal and elegant</option>
                    <option value="Gift bouquet">Gift bouquet</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="rb-pet-type" className="text-xs uppercase tracking-widest text-[#6B7280]">Pet at home</Label>
                  <select
                    id="rb-pet-type"
                    value={requestForm.pet_type}
                    onChange={(e) => setRequestForm({ ...requestForm, pet_type: e.target.value })}
                    className="mt-1.5 w-full appearance-none border border-[#E5E0D6] rounded-md px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399]"
                    required
                    data-testid="request-bouquet-pet-type"
                  >
                    <option value="">Select pet...</option>
                    <option value="Cat">Cat</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat and dog">Cat and dog</option>
                    <option value="Petless">Petless</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="rb-occasion" className="text-xs uppercase tracking-widest text-[#6B7280]">
                    Occasion <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
                  </Label>
                  <Input
                    id="rb-occasion"
                    value={requestForm.occasion}
                    onChange={(e) => setRequestForm({ ...requestForm, occasion: e.target.value })}
                    placeholder="Birthday, new home, just because..."
                    className="mt-1.5 bg-white border-[#E5E0D6]"
                    data-testid="request-bouquet-occasion"
                  />
                </div>

                <div>
                  <Label htmlFor="rb-date" className="text-xs uppercase tracking-widest text-[#6B7280]">
                    Preferred date <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
                  </Label>
                  <Input
                    id="rb-date"
                    type="date"
                    value={requestForm.preferred_date}
                    onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })}
                    className="mt-1.5 bg-white border-[#E5E0D6]"
                    data-testid="request-bouquet-date"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rb-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Your name</Label>
                    <Input
                      id="rb-name"
                      value={requestForm.full_name}
                      onChange={(e) => setRequestForm({ ...requestForm, full_name: e.target.value })}
                      placeholder="Jane Doe"
                      className="mt-1.5 bg-white border-[#E5E0D6]"
                      required
                      data-testid="request-bouquet-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rb-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Email</Label>
                    <Input
                      id="rb-email"
                      type="email"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className="mt-1.5 bg-white border-[#E5E0D6]"
                      required
                      data-testid="request-bouquet-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rb-notes" className="text-xs uppercase tracking-widest text-[#6B7280]">
                    Anything else <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
                  </Label>
                  <Textarea
                    id="rb-notes"
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value.slice(0, 800) })}
                    placeholder="Colours, size, stems you love, pets who nibble everything..."
                    className="mt-1.5 bg-white border-[#E5E0D6] min-h-[80px]"
                    data-testid="request-bouquet-notes"
                  />
                  <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{requestForm.notes.length}/800</p>
                </div>

                {requestError && (
                  <p className="text-sm text-red-500 font-light" data-testid="request-bouquet-error">{requestError}</p>
                )}

                <Button
                  type="submit"
                  disabled={requestSubmitting}
                  className="w-full rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest"
                  data-testid="request-bouquet-submit"
                >
                  {requestSubmitting ? (
                    <><Loader2 size={14} className="mr-2 animate-spin" /> Sending request...</>
                  ) : (
                    <>Send request <ArrowRight size={14} className="ml-2" /></>
                  )}
                </Button>
                <p className="text-[10px] text-[#9CA3AF] text-center font-light">
                  We'll reply within 2 working days from info@petalandpaw.co.uk.
                </p>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
