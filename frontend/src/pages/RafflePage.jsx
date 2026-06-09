import { useState } from "react";
import { Heart, Ticket, ArrowRight, Loader as Loader2, Minus, Plus, Award, Flower2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RafflePage() {
  const { customer } = useCustomerAuth();
  const [qty, setQty] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openDialog = () => {
    setForm({ full_name: customer?.name || "", email: customer?.email || "" });
    setError("");
    setDialogOpen(true);
  };

  const submitRaffle = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/raffle/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          quantity: qty,
          origin_url: window.location.origin,
          customer_id: customer?.id || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Unable to start checkout. Please try again.");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Payment session unavailable.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="raffle-page">
      <SEOHead title="Camp Beagle Raffle" description="Buy a £2 raffle ticket to support Camp Beagle, the longest-running animal rights camp in the UK." />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">

        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#B8926A]/15 mb-5">
            <Heart size={24} strokeWidth={1.5} className="text-[#B8926A]" />
          </div>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#B8926A] mb-3 block">Charity Raffle</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-4">
            Support Camp Beagle
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Buy a raffle ticket and help fund the longest-running animal rights camp in the UK. Every penny counts.
          </p>
          <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-widest mt-3">UK only</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-fade-in-up delay-100">

          {/* About Camp Beagle */}
          <div className="relative bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#B8926A]/8 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-[#8DA399]/8 blur-2xl pointer-events-none" />

            <div className="relative">
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-5">About Camp Beagle</h2>

              <div className="space-y-4 text-sm sm:text-base font-light leading-[1.8] text-[#6B7280]">
                <p>
                  Camp Beagle is a grassroots animal rights protest group, the longest-running animal rights camp in the UK and globally. They are fighting to shut down MBR Acres, a facility that breeds over 2,000 beagle puppies a year for laboratory testing.
                </p>
                <p>
                  Since the summer of 2021 they have camped outside MBR Acres in Huntingdon, Cambridgeshire, in peaceful protest, campaigning tirelessly to save the beagles bred for experimentation.
                </p>
                <p>
                  Everyone involved in Camp Beagle contributes their time, expertise, and dedication on a voluntary basis.
                </p>
                <p>
                  All donations, which are gratefully received, are used to cover the essential costs of running Camp Beagle and sustaining their campaign to shut down MBR Acres for good.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E5E0D6]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#8DA399]" />
                  <span className="text-xs font-light text-[#6B7280]">100% of raffle proceeds go directly to Camp Beagle</span>
                </div>
                <a
                  href="https://thecampbeagle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[#B8926A] hover:text-[#9A7A56] transition-colors group"
                >
                  Find out more about Camp Beagle <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Raffle Ticket Purchase */}
          <div className="relative bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 overflow-hidden flex flex-col">
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#D4A574]/10 blur-2xl pointer-events-none" />

            <div className="relative flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#B8926A]/15 flex items-center justify-center">
                  <Ticket size={18} strokeWidth={1.5} className="text-[#B8926A]" />
                </div>
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C]">Raffle Tickets</h2>
              </div>

              <div className="bg-[#F2F0EB]/80 rounded-xl p-6 mb-6">
                <div className="text-center mb-6">
                  <span className="text-4xl sm:text-5xl font-light text-[#2C2C2C]">&pound;2</span>
                  <span className="text-sm font-light text-[#6B7280] ml-2">per ticket</span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#E5E0D6]">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Tickets</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="w-9 h-9 rounded-full bg-[#F2F0EB] border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#E5E0D6]"
                      aria-label="Decrease quantity"
                      data-testid="raffle-qty-minus"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-lg font-medium text-[#2C2C2C] min-w-[28px] text-center" data-testid="raffle-qty-value">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(20, q + 1))}
                      disabled={qty >= 20}
                      className="w-9 h-9 rounded-full bg-[#F2F0EB] border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#E5E0D6]"
                      aria-label="Increase quantity"
                      data-testid="raffle-qty-plus"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E0D6]">
                  <span className="text-sm font-light text-[#6B7280]">Total</span>
                  <span className="text-xl font-medium text-[#2C2C2C]">&pound;{(qty * 2).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  onClick={openDialog}
                  className="w-full rounded-full bg-[#B8926A] text-white hover:bg-[#B8926A]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-[1.02]"
                  data-testid="raffle-buy-btn"
                >
                  Buy Raffle Ticket{qty > 1 ? "s" : ""} <ArrowRight size={14} className="ml-2" />
                </Button>
                <p className="text-[10px] text-[#9CA3AF] text-center mt-3 font-light">
                  Secure payment via Stripe. Ticket number(s) emailed to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="mt-12 sm:mt-16 animate-fade-in-up delay-150">
          <div className="text-center mb-8">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#B8926A] mb-2 block">What You Could Win</span>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C]">Prizes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Prize */}
            <div className="relative group bg-white border-2 border-[#B8926A]/40 rounded-2xl p-6 sm:p-8 text-center overflow-hidden hover:shadow-lg hover:shadow-[#B8926A]/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B8926A]/5 to-[#D4A574]/5 pointer-events-none" />
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#B8926A]/8 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#B8926A] to-[#D4A574] mb-4 shadow-md shadow-[#B8926A]/20">
                  <Crown size={22} strokeWidth={1.5} className="text-white" />
                </div>
                <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#B8926A] mb-2">1st Prize</span>
                <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">A Bouquet Every Month</h3>
                <p className="text-sm font-light text-[#6B7280] leading-relaxed">
                  A stunning, hand-crafted bouquet delivered to your door every month for an entire year. 12 bouquets in total.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-[#B8926A]/10 rounded-full px-3 py-1.5">
                  <Flower2 size={12} className="text-[#B8926A]" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#B8926A]">12 Months</span>
                </div>
              </div>
            </div>

            {/* Second Prize */}
            <div className="relative group bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 text-center overflow-hidden hover:shadow-lg hover:shadow-[#8DA399]/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -top-8 -left-8 w-20 h-20 rounded-full bg-[#8DA399]/8 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#8DA399] to-[#A8BFB0] mb-4 shadow-md shadow-[#8DA399]/20">
                  <Award size={22} strokeWidth={1.5} className="text-white" />
                </div>
                <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#8DA399] mb-2">2nd Prize</span>
                <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">A Beautiful Bouquet</h3>
                <p className="text-sm font-light text-[#6B7280] leading-relaxed">
                  One gorgeous, seasonal hand-tied bouquet crafted with love and delivered straight to you.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-[#8DA399]/10 rounded-full px-3 py-1.5">
                  <Flower2 size={12} className="text-[#8DA399]" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8DA399]">1 Bouquet</span>
                </div>
              </div>
            </div>

            {/* Third Prize */}
            <div className="relative group bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 text-center overflow-hidden hover:shadow-lg hover:shadow-[#D4A574]/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-[#D4A574]/8 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#D4A574] to-[#E5C4A0] mb-4 shadow-md shadow-[#D4A574]/20">
                  <Award size={22} strokeWidth={1.5} className="text-white" />
                </div>
                <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#D4A574] mb-2">3rd Prize</span>
                <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">A Beautiful Bouquet</h3>
                <p className="text-sm font-light text-[#6B7280] leading-relaxed">
                  Another stunning, seasonal hand-tied bouquet. Because one winner is never enough.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-[#D4A574]/10 rounded-full px-3 py-1.5">
                  <Flower2 size={12} className="text-[#D4A574]" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#D4A574]">1 Bouquet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 sm:mt-16 animate-fade-in-up delay-200">
          <div className="bg-[#F2F0EB]/50 border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-5 text-center">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center mb-3">
                  <span className="text-sm font-medium text-[#B8926A]">1</span>
                </div>
                <p className="text-sm font-light text-[#4B5563]">Choose how many tickets you'd like and complete payment</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center mb-3">
                  <span className="text-sm font-medium text-[#B8926A]">2</span>
                </div>
                <p className="text-sm font-light text-[#4B5563]">Receive your unique ticket number(s) by email</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center mb-3">
                  <span className="text-sm font-medium text-[#B8926A]">3</span>
                </div>
                <p className="text-sm font-light text-[#4B5563]">We'll announce the winner and all proceeds go to Camp Beagle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !submitting && setDialogOpen(open)}>
        <DialogContent className="bg-[#FAF9F6] max-w-md border-[#E5E0D6] rounded-2xl" data-testid="raffle-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium">
              Camp Beagle Raffle
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280] pt-1">
              {qty} ticket{qty > 1 ? "s" : ""} &mdash; &pound;{(qty * 2).toFixed(2)} total
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitRaffle} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="raffle-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Full Name</Label>
              <Input
                id="raffle-name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Jane Doe"
                className="mt-1.5 bg-white border-[#E5E0D6]"
                required
                data-testid="raffle-name-input"
              />
            </div>
            <div>
              <Label htmlFor="raffle-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Email</Label>
              <Input
                id="raffle-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1.5 bg-white border-[#E5E0D6]"
                required
                data-testid="raffle-email-input"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 font-light" data-testid="raffle-error">{error}</p>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#B8926A] text-white hover:bg-[#B8926A]/90 px-8 py-6 text-xs uppercase tracking-widest"
              data-testid="raffle-submit-btn"
            >
              {submitting ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Redirecting to payment...</>
              ) : (
                <>Continue to payment <ArrowRight size={14} className="ml-2" /></>
              )}
            </Button>
            <p className="text-[10px] text-[#9CA3AF] text-center font-light">
              Secure payment via Stripe. Your ticket number(s) will be emailed to you.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
