import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, ArrowRight, Loader as Loader2, Sparkles, Calendar, Clock, MapPin, CircleCheck as CheckCircle2, Ticket, Copy, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";
import { redeemableWorkshops } from "@/lib/workshops";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PRESET_AMOUNTS = [25, 50, 75, 100, 150, 250];
const MAX_AMOUNT = 250;
const MIN_AMOUNT = 10;

export default function VouchersPage() {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  // Purchase form
  const [amountSelection, setAmountSelection] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [purchaseForm, setPurchaseForm] = useState({
    purchaser_name: "",
    purchaser_email: "",
    recipient_name: "",
    recipient_email: "",
    personal_message: "",
  });
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  // Redeem flow
  const [voucherCode, setVoucherCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [voucher, setVoucher] = useState(null); // { code, remaining_balance, original_amount }
  const [voucherError, setVoucherError] = useState("");
  const [selected, setSelected] = useState({}); // { workshop_id: quantity }
  const [redeemForm, setRedeemForm] = useState({ full_name: "", customer_email: "", notes: "" });
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(null); // { voucher_applied, excess, remaining_balance, items }

  useEffect(() => {
    if (customer) {
      setPurchaseForm((p) => ({
        ...p,
        purchaser_name: p.purchaser_name || customer.name || "",
        purchaser_email: p.purchaser_email || customer.email || "",
      }));
      setRedeemForm((r) => ({
        ...r,
        full_name: r.full_name || customer.name || "",
        customer_email: r.customer_email || customer.email || "",
      }));
    }
  }, [customer]);

  const workshops = redeemableWorkshops();

  const resolveAmount = () => {
    if (amountSelection === "custom") {
      const n = parseFloat(customAmount);
      return isNaN(n) ? 0 : n;
    }
    return Number(amountSelection) || 0;
  };

  const amount = resolveAmount();
  const amountValid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;

  const handlePurchase = async (e) => {
    e.preventDefault();
    setPurchaseError("");
    if (!amountValid) {
      setPurchaseError(`Amount must be between £${MIN_AMOUNT} and £${MAX_AMOUNT}.`);
      return;
    }
    if (!purchaseForm.purchaser_name.trim() || !purchaseForm.purchaser_email.trim()) {
      setPurchaseError("Your name and email are required.");
      return;
    }
    setPurchasing(true);
    try {
      const res = await fetch(`${API}/vouchers/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          purchaser_name: purchaseForm.purchaser_name.trim(),
          purchaser_email: purchaseForm.purchaser_email.trim(),
          recipient_name: purchaseForm.recipient_name.trim(),
          recipient_email: purchaseForm.recipient_email.trim(),
          personal_message: purchaseForm.personal_message.trim(),
          origin_url: window.location.origin,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Unable to start checkout. Please try again.");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Payment session unavailable.");
    } catch (err) {
      setPurchaseError(err.message || "Something went wrong.");
      setPurchasing(false);
    }
  };

  const handleValidate = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setVoucherError("Please enter a voucher code.");
      return;
    }
    setValidating(true);
    setVoucherError("");
    setVoucher(null);
    setRedeemSuccess(null);
    try {
      const res = await fetch(`${API}/vouchers/validate/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Voucher not found.");
      }
      setVoucher(data);
      setSelected({});
      toast.success(`Voucher loaded - £${data.remaining_balance.toFixed(2)} available`);
    } catch (err) {
      setVoucherError(err.message || "Could not validate voucher.");
    } finally {
      setValidating(false);
    }
  };

  const updateSelected = (id, delta) => {
    setSelected((prev) => {
      const cur = prev[id] || 0;
      const next = Math.max(0, Math.min(10, cur + delta));
      const out = { ...prev };
      if (next === 0) delete out[id];
      else out[id] = next;
      return out;
    });
  };

  const cartItems = workshops
    .filter((w) => (selected[w.id] || 0) > 0)
    .map((w) => ({ ...w, quantity: selected[w.id] }));
  const cartTotal = cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const voucherBalance = voucher?.remaining_balance || 0;
  const voucherApplied = Math.min(voucherBalance, cartTotal);
  const excess = Math.max(0, cartTotal - voucherApplied);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeemError("");
    if (!voucher) return;
    if (cartItems.length === 0) {
      setRedeemError("Select at least one workshop to redeem.");
      return;
    }
    if (!redeemForm.full_name.trim() || !redeemForm.customer_email.trim()) {
      setRedeemError("Full name and email are required.");
      return;
    }
    setRedeeming(true);
    try {
      const items = cartItems.map((it) => ({
        workshop_id: it.id,
        workshop_name: it.name,
        workshop_location: it.place,
        workshop_address: it.address || "",
        workshop_date: it.date,
        workshop_time: it.time,
        price: it.price,
        quantity: it.quantity,
      }));
      const res = await fetch(`${API}/vouchers/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucher.code,
          items,
          full_name: redeemForm.full_name.trim(),
          customer_email: redeemForm.customer_email.trim(),
          notes: redeemForm.notes.trim(),
          origin_url: window.location.origin,
          customer_id: customer?.id || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Could not redeem voucher.");
      }
      if (data.covered) {
        setRedeemSuccess({
          covered: true,
          voucher_applied: data.voucher_applied,
          excess: 0,
          remaining_balance: data.remaining_balance,
          items: cartItems,
        });
        setSelected({});
        setRedeeming(false);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Unexpected response.");
      }
    } catch (err) {
      setRedeemError(err.message || "Something went wrong.");
      setRedeeming(false);
    }
  };

  const [codeCopied, setCodeCopied] = useState(false);
  const copyCode = async () => {
    if (!voucher) return;
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="vouchers-page">
      <SEOHead title="Vouchers" description="Buy a Petal & Paw voucher for any flower arranging workshop. Up to £250." keywords="voucher, gift card, workshop voucher" />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#C4A2B0] mb-2 sm:mb-3 block">Vouchers</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Give the gift of flowers
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Buy a voucher for someone special, or redeem a code against any of our upcoming workshops. Up to £{MAX_AMOUNT}.
          </p>
        </div>

        {/* Buy Voucher Section */}
        <section className="mb-16 sm:mb-20 animate-fade-in-up delay-100" id="buy" data-testid="buy-voucher-section">
          <div className="bg-white border border-[#E5E0D6] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
            {/* Voucher visual */}
            <div className="md:col-span-2 relative bg-gradient-to-br from-[#F2F0EB] via-[#FAF9F6] to-[#F2F0EB] p-8 sm:p-10 flex flex-col justify-between min-h-[280px]">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#C4A2B0]/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-[#8DA399]/10 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur mb-5">
                  <Gift size={20} strokeWidth={1.5} className="text-[#C4A2B0]" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#C4A2B0] mb-2 block">Petal & Paw Voucher</span>
                <p className="font-['Playfair_Display'] text-4xl sm:text-5xl font-medium text-[#2C2C2C] tracking-tight leading-none">
                  £{amount > 0 ? amount.toFixed(0) : "—"}
                </p>
              </div>
              <div className="relative mt-6">
                <p className="text-xs font-light text-[#6B7280] leading-relaxed">
                  Redeemable against any flower arranging workshop. Unused balance carries forward.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePurchase} className="md:col-span-3 p-6 sm:p-8 lg:p-10 space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-widest text-[#6B7280] mb-2 block">Choose Amount</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {PRESET_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setAmountSelection(v); setCustomAmount(""); }}
                      className={`rounded-xl border px-3 py-3 sm:py-3.5 text-sm transition-all ${
                        amountSelection === v
                          ? "border-[#C4A2B0] bg-[#C4A2B0]/10 text-[#2C2C2C] font-medium"
                          : "border-[#E5E0D6] text-[#6B7280] hover:border-[#C4A2B0]/50"
                      }`}
                      data-testid={`voucher-preset-${v}`}
                    >
                      £{v}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAmountSelection("custom")}
                  className={`mt-2 text-xs uppercase tracking-widest font-semibold transition-colors ${
                    amountSelection === "custom" ? "text-[#C4A2B0]" : "text-[#6B7280] hover:text-[#2C2C2C]"
                  }`}
                  data-testid="voucher-custom-toggle"
                >
                  Or enter a custom amount
                </button>
                {amountSelection === "custom" && (
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">£</span>
                    <Input
                      type="number"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      step="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`${MIN_AMOUNT} - ${MAX_AMOUNT}`}
                      className="pl-7 bg-white border-[#E5E0D6]"
                      data-testid="voucher-custom-amount"
                    />
                  </div>
                )}
                <p className="text-[10px] text-[#9CA3AF] mt-1.5">Min £{MIN_AMOUNT} - Max £{MAX_AMOUNT}.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="vp-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Your name</Label>
                  <Input
                    id="vp-name"
                    value={purchaseForm.purchaser_name}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaser_name: e.target.value })}
                    placeholder="Jane Doe"
                    className="mt-1.5 bg-white border-[#E5E0D6]"
                    required
                    data-testid="voucher-purchaser-name"
                  />
                </div>
                <div>
                  <Label htmlFor="vp-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Your email</Label>
                  <Input
                    id="vp-email"
                    type="email"
                    value={purchaseForm.purchaser_email}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaser_email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1.5 bg-white border-[#E5E0D6]"
                    required
                    data-testid="voucher-purchaser-email"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5E0D6] pt-5">
                <span className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold flex items-center gap-2">
                  <Sparkles size={12} className="text-[#C4A2B0]" /> Sending as a gift? <span className="text-[10px] font-normal text-[#9CA3AF] normal-case tracking-normal">(optional)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label htmlFor="vp-rname" className="text-xs uppercase tracking-widest text-[#6B7280]">Recipient name</Label>
                    <Input
                      id="vp-rname"
                      value={purchaseForm.recipient_name}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, recipient_name: e.target.value })}
                      placeholder="Sarah"
                      className="mt-1.5 bg-white border-[#E5E0D6]"
                      data-testid="voucher-recipient-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vp-remail" className="text-xs uppercase tracking-widest text-[#6B7280]">Recipient email</Label>
                    <Input
                      id="vp-remail"
                      type="email"
                      value={purchaseForm.recipient_email}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, recipient_email: e.target.value })}
                      placeholder="sarah@example.com"
                      className="mt-1.5 bg-white border-[#E5E0D6]"
                      data-testid="voucher-recipient-email"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="vp-msg" className="text-xs uppercase tracking-widest text-[#6B7280]">Personal message</Label>
                  <Textarea
                    id="vp-msg"
                    value={purchaseForm.personal_message}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, personal_message: e.target.value.slice(0, 500) })}
                    placeholder="A note to go with the voucher..."
                    className="mt-1.5 bg-white border-[#E5E0D6] min-h-[80px]"
                    data-testid="voucher-personal-message"
                  />
                  <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{purchaseForm.personal_message.length}/500</p>
                </div>
              </div>

              {purchaseError && (
                <p className="text-sm text-red-500 font-light" data-testid="voucher-purchase-error">{purchaseError}</p>
              )}

              <Button
                type="submit"
                disabled={purchasing}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full transition-all hover:scale-[1.02]"
                data-testid="voucher-purchase-submit"
              >
                {purchasing ? (
                  <><Loader2 size={14} className="mr-2 animate-spin" /> Redirecting to payment...</>
                ) : (
                  <>Buy voucher - £{amount > 0 ? amount.toFixed(2) : "—"} <ArrowRight size={14} className="ml-2" /></>
                )}
              </Button>
              <p className="text-[10px] text-[#9CA3AF] text-center font-light">
                Secure checkout via Stripe. The voucher code will be emailed once payment confirms.
              </p>
            </form>
          </div>
        </section>

        {/* Redeem Section */}
        <section className="animate-fade-in-up delay-200" id="redeem" data-testid="redeem-voucher-section">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 block">Redeem</span>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">
              Have a voucher?
            </h2>
            <p className="text-sm font-light text-[#6B7280] max-w-xl mx-auto">
              Enter your code to see your balance, then pick the workshops you want to spend it on.
            </p>
          </div>

          <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Label htmlFor="vc-code" className="text-xs uppercase tracking-widest text-[#6B7280]">Voucher code</Label>
                <div className="mt-1.5 relative">
                  <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA399]" />
                  <Input
                    id="vc-code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="PP-XXXX-XXXX-XXXX"
                    onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                    className="pl-9 bg-white border-[#E5E0D6] font-mono tracking-wider"
                    data-testid="voucher-code-input"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleValidate}
                disabled={validating}
                className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest sm:w-auto w-full"
                data-testid="voucher-validate-btn"
              >
                {validating ? <><Loader2 size={14} className="mr-2 animate-spin" /> Checking...</> : <>Apply code <ArrowRight size={14} className="ml-2" /></>}
              </Button>
            </div>
            {voucherError && <p className="text-sm text-red-500 font-light mt-3" data-testid="voucher-code-error">{voucherError}</p>}

            {voucher && (
              <div className="mt-5 pt-5 border-t border-[#E5E0D6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid="voucher-loaded">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#8DA399] flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold">Voucher Active</p>
                    <button onClick={copyCode} className="font-mono text-sm tracking-wider text-[#2C2C2C] hover:text-[#8DA399] transition-colors flex items-center gap-1.5 mt-0.5">
                      {voucher.code}
                      {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold">Balance</p>
                  <p className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C]">£{voucher.remaining_balance.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {voucher && !redeemSuccess && (
            <>
              <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-5">Choose your workshops</h3>
              <div className="space-y-4 mb-8">
                {workshops.map((w) => {
                  const qty = selected[w.id] || 0;
                  const lineTotal = qty * w.price;
                  return (
                    <div
                      key={w.id}
                      className={`bg-white border rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 transition-all ${
                        qty > 0 ? "border-[#8DA399] ring-1 ring-[#8DA399]/20" : "border-[#E5E0D6]"
                      }`}
                      data-testid={`redeem-workshop-${w.id}`}
                    >
                      <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[180px] bg-[#F2F0EB] overflow-hidden">
                        <img src={w.image} alt={w.place} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="p-5 sm:col-span-2 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-light mb-0.5" style={{ color: w.accent }}>
                              <MapPin size={12} />
                              <span>{w.place}</span>
                            </div>
                            <h4 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C]">{w.name}</h4>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-lg font-light text-[#2C2C2C]">£{w.price}</span>
                            <span className="text-xs font-light text-[#6B7280]">/person</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 bg-[#F2F0EB] rounded-full px-3 py-1 text-xs font-light text-[#6B7280]">
                            <Calendar size={12} className="text-[#8DA399]" /> {w.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#F2F0EB] rounded-full px-3 py-1 text-xs font-light text-[#6B7280]">
                            <Clock size={12} className="text-[#8DA399]" /> {w.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateSelected(w.id, -1)}
                              disabled={qty <= 0}
                              className="w-8 h-8 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#F2F0EB]"
                              data-testid={`redeem-qty-minus-${w.id}`}
                              aria-label="Decrease tickets"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-base font-medium text-[#2C2C2C] min-w-[20px] text-center" data-testid={`redeem-qty-${w.id}`}>{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateSelected(w.id, 1)}
                              disabled={qty >= 10}
                              className="w-8 h-8 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#F2F0EB]"
                              data-testid={`redeem-qty-plus-${w.id}`}
                              aria-label="Increase tickets"
                            >
                              <Plus size={14} />
                            </button>
                            <span className="text-xs font-light text-[#6B7280] ml-1">{qty === 1 ? "ticket" : "tickets"}</span>
                          </div>
                          {qty > 0 && (
                            <span className="text-sm font-medium text-[#2C2C2C]">£{lineTotal.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary + Form */}
              <form onSubmit={handleRedeem} className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8" data-testid="redeem-summary">
                <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-4">Summary</h3>
                <div className="space-y-2.5 text-sm font-light mb-5">
                  <div className="flex items-center justify-between text-[#4B5563]">
                    <span>Cart total</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8DA399]">
                    <span>Voucher applied</span>
                    <span>- £{voucherApplied.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#2C2C2C] pt-2.5 border-t border-[#E5E0D6] text-base font-medium">
                    <span>{excess > 0 ? "Top-up to pay" : "Due now"}</span>
                    <span>£{excess.toFixed(2)}</span>
                  </div>
                  {excess === 0 && cartTotal > 0 && voucherBalance - voucherApplied > 0 && (
                    <p className="text-[11px] text-[#6B7280]">£{(voucherBalance - voucherApplied).toFixed(2)} remaining on your voucher after this redemption.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label htmlFor="rd-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Full name</Label>
                    <Input
                      id="rd-name"
                      value={redeemForm.full_name}
                      onChange={(e) => setRedeemForm({ ...redeemForm, full_name: e.target.value })}
                      placeholder="Jane Doe"
                      className="mt-1.5 bg-white border-[#E5E0D6]"
                      required
                      data-testid="redeem-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rd-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Email</Label>
                    <Input
                      id="rd-email"
                      type="email"
                      value={redeemForm.customer_email}
                      onChange={(e) => setRedeemForm({ ...redeemForm, customer_email: e.target.value })}
                      placeholder="you@example.com"
                      className="mt-1.5 bg-white border-[#E5E0D6]"
                      required
                      data-testid="redeem-email"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="rd-notes" className="text-xs uppercase tracking-widest text-[#6B7280]">
                    Dietary / Access notes <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
                  </Label>
                  <Textarea
                    id="rd-notes"
                    value={redeemForm.notes}
                    onChange={(e) => setRedeemForm({ ...redeemForm, notes: e.target.value.slice(0, 500) })}
                    placeholder="Anything we should know..."
                    className="mt-1.5 bg-white border-[#E5E0D6] min-h-[70px]"
                    data-testid="redeem-notes"
                  />
                </div>

                {redeemError && (
                  <p className="text-sm text-red-500 font-light mb-3" data-testid="redeem-error">{redeemError}</p>
                )}

                <Button
                  type="submit"
                  disabled={redeeming || cartItems.length === 0}
                  className="w-full rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest"
                  data-testid="redeem-submit"
                >
                  {redeeming ? (
                    <><Loader2 size={14} className="mr-2 animate-spin" /> {excess > 0 ? "Redirecting to Stripe..." : "Booking your workshops..."}</>
                  ) : excess > 0 ? (
                    <>Pay £{excess.toFixed(2)} top-up <ArrowRight size={14} className="ml-2" /></>
                  ) : (
                    <>Book with voucher <ArrowRight size={14} className="ml-2" /></>
                  )}
                </Button>
                <p className="text-[10px] text-[#9CA3AF] text-center font-light mt-3">
                  {excess > 0
                    ? "You'll be redirected to Stripe to pay the difference. Your voucher discount applies automatically."
                    : "Your workshops will be booked instantly using your voucher balance."}
                </p>
              </form>
            </>
          )}

          {/* Success state for fully-covered redemption */}
          <Dialog open={!!redeemSuccess} onOpenChange={(o) => { if (!o) setRedeemSuccess(null); }}>
            <DialogContent className="bg-[#FAF9F6] max-w-md" data-testid="redeem-success-dialog">
              <DialogHeader>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#8DA399]/15 mb-3 mx-auto">
                  <CheckCircle2 size={28} strokeWidth={1.5} className="text-[#8DA399]" />
                </div>
                <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium text-center">
                  Workshops booked using voucher
                </DialogTitle>
                <DialogDescription className="text-sm font-light text-[#6B7280] pt-1 text-center">
                  We've sent confirmation emails for each booking.
                </DialogDescription>
              </DialogHeader>
              {redeemSuccess && (
                <div className="space-y-3 mt-2">
                  <div className="bg-white border border-[#E5E0D6] rounded-xl p-4 space-y-2">
                    {redeemSuccess.items?.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-sm font-light">
                        <span className="text-[#4B5563]">{it.place} - {it.date}</span>
                        <span className="text-[#2C2C2C]">{it.quantity} × £{it.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#F2F0EB]/60 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-sm font-light text-[#8DA399]">
                      <span>Voucher applied</span>
                      <span>- £{redeemSuccess.voucher_applied.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium text-[#2C2C2C] pt-1.5 border-t border-[#E5E0D6]">
                      <span>Voucher balance remaining</span>
                      <span>£{(redeemSuccess.remaining_balance ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={() => { setRedeemSuccess(null); navigate("/workshops"); }}
                      className="flex-1 rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest"
                      data-testid="redeem-success-back"
                    >
                      Back to workshops
                    </Button>
                    <Button
                      onClick={() => setRedeemSuccess(null)}
                      variant="outline"
                      className="flex-1 rounded-full border-[#E5E0D6] text-[#6B7280] hover:text-[#2C2C2C] px-6 py-5 text-xs uppercase tracking-widest"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  );
}
