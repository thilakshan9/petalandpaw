import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Gift, ArrowRight, Loader as Loader2, Minus, Plus, Sparkles, CircleCheck as CheckCircle2, Heart, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";
import { WORKSHOPS, upcomingWorkshops } from "@/lib/workshops";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WorkshopsPage() {
  const { customer, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();

  const [qty, setQty] = useState({}); // per-workshop quantity
  const [guestDialog, setGuestDialog] = useState(null); // workshop pending account choice
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [form, setForm] = useState({ full_name: "", customer_email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Request-your-own-workshop dialog state
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    event_type: "",
    event_type_other: "",
    city: "",
    headcount: "",
    preferred_date: "",
    full_name: "",
    email: "",
    notes: "",
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Raffle state
  const [raffleQty, setRaffleQty] = useState(1);
  const [raffleOpen, setRaffleOpen] = useState(false);
  const [raffleForm, setRaffleForm] = useState({ full_name: "", email: "" });
  const [raffleSubmitting, setRaffleSubmitting] = useState(false);
  const [raffleError, setRaffleError] = useState("");

  const getQty = (id) => Math.max(1, Math.min(10, qty[id] || 1));
  const updateQty = (id, delta) => {
    setQty((q) => ({ ...q, [id]: Math.max(1, Math.min(10, (q[id] || 1) + delta)) }));
  };

  // Resume booking flow after login (if pending)
  useEffect(() => {
    if (authLoading || !customer) return;
    const pending = localStorage.getItem("pp_pending_workshop_checkout");
    if (!pending) return;
    try {
      const data = JSON.parse(pending);
      localStorage.removeItem("pp_pending_workshop_checkout");
      const w = WORKSHOPS.find((x) => x.id === data.workshop_id);
      if (w) {
        setQty((q) => ({ ...q, [w.id]: data.quantity || 1 }));
        setSelectedWorkshop(w);
        setForm({ full_name: customer.name || "", customer_email: customer.email || "", notes: data.notes || "" });
        setError("");
        setBookingOpen(true);
      }
    } catch {
      localStorage.removeItem("pp_pending_workshop_checkout");
    }
  }, [authLoading, customer]);

  const handleBookClick = (workshop) => {
    if (customer) {
      // Logged in — go straight to booking dialog with prefilled info
      setSelectedWorkshop(workshop);
      setForm({ full_name: customer.name || "", customer_email: customer.email || "", notes: "" });
      setError("");
      setBookingOpen(true);
    } else {
      // Not logged in — show guest/sign-in choice
      setSelectedWorkshop(workshop);
      setGuestDialog(workshop);
    }
  };

  const handleGuestContinue = () => {
    setGuestDialog(null);
    setForm({ full_name: "", customer_email: "", notes: "" });
    setError("");
    setBookingOpen(true);
  };

  const handleGuestLogin = () => {
    // Save pending workshop so we can resume after login
    if (selectedWorkshop) {
      localStorage.setItem("pp_pending_workshop_checkout", JSON.stringify({
        workshop_id: selectedWorkshop.id,
        quantity: getQty(selectedWorkshop.id),
        notes: form.notes || "",
      }));
    }
    setGuestDialog(null);
    navigate("/login");
  };

  const openRequestDialog = () => {
    setRequestForm({
      event_type: "",
      event_type_other: "",
      city: "",
      headcount: "",
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
    if (!f.event_type || !f.city.trim() || !f.headcount || !f.full_name.trim() || !f.email.trim()) {
      setRequestError("Please fill in the required fields.");
      return;
    }
    if (f.event_type === "other" && !f.event_type_other.trim()) {
      setRequestError("Please tell us what kind of event you're planning.");
      return;
    }
    setRequestSubmitting(true);
    setRequestError("");
    const eventLabel = f.event_type === "other" ? f.event_type_other.trim() : f.event_type;
    const message = [
      `Event type: ${eventLabel}`,
      `City / Location: ${f.city.trim()}`,
      `Approximate guests: ${f.headcount}`,
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
          subject: `Workshop Request - ${eventLabel}`,
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

  const openRaffleDialog = () => {
    setRaffleForm({ full_name: customer?.name || "", email: customer?.email || "" });
    setRaffleError("");
    setRaffleQty(1);
    setRaffleOpen(true);
  };

  const submitRaffle = async (e) => {
    e.preventDefault();
    if (!raffleForm.full_name.trim() || !raffleForm.email.trim()) {
      setRaffleError("Please enter your name and email.");
      return;
    }
    setRaffleSubmitting(true);
    setRaffleError("");
    try {
      const res = await fetch(`${API}/raffle/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: raffleForm.full_name.trim(),
          email: raffleForm.email.trim(),
          quantity: raffleQty,
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
      setRaffleError(err.message || "Something went wrong. Please try again.");
      setRaffleSubmitting(false);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!selectedWorkshop) return;
    if (!form.full_name.trim() || !form.customer_email.trim()) {
      setError("Please enter your full name and email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const quantity = getQty(selectedWorkshop.id);
      const res = await fetch(`${API}/workshops/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshop_id: selectedWorkshop.id,
          workshop_name: selectedWorkshop.name,
          workshop_location: selectedWorkshop.place,
          workshop_address: selectedWorkshop.address || "",
          workshop_date: selectedWorkshop.date,
          workshop_time: selectedWorkshop.time,
          price: selectedWorkshop.price,
          quantity,
          full_name: form.full_name.trim(),
          customer_email: form.customer_email.trim(),
          notes: form.notes.trim(),
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
    <div className="py-8 sm:py-12 md:py-20" data-testid="workshops-page">
      <SEOHead title="Workshops" description="Join our flower arranging workshops. Create your own pet-safe bouquet in a fun, relaxed setting." />
      <div className="container mx-auto px-5 md:px-8 max-w-6xl">

        <div className="text-center mb-10 sm:mb-12 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Workshops</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Upcoming Workshops
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Learn to arrange beautiful, pet-safe flowers in a fun and relaxed setting. No experience needed - just come ready to create.
          </p>
        </div>

        {/* Request Your Own Workshop CTA (hero) */}
        <div className="mb-12 sm:mb-16 animate-fade-in-up delay-50" data-testid="request-workshop-hero">
          <div className="relative bg-white border border-[#E5E0D6] rounded-2xl px-6 py-7 sm:px-10 sm:py-9 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#C4A2B0]/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-[#8DA399]/10 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-11 h-11 flex-shrink-0 rounded-full bg-[#C4A2B0]/15 flex items-center justify-center">
                  <Sparkles size={18} strokeWidth={1.5} className="text-[#C4A2B0]" />
                </div>
                <span className="md:hidden text-[10px] uppercase tracking-[0.3em] font-semibold text-[#C4A2B0]">Bespoke Workshops</span>
              </div>
              <div className="flex-1">
                <span className="hidden md:block text-[10px] uppercase tracking-[0.3em] font-semibold text-[#C4A2B0] mb-1.5">Bespoke Workshops</span>
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-2 leading-tight">
                  Hosting something special? We'll build a workshop around you.
                </h2>
                <p className="text-sm font-light text-[#6B7280] leading-relaxed">
                  From hen dos and birthdays to corporate away days and team socials, share a few details and we'll design a private, pet-safe flower arranging experience tailored to your group.
                </p>
              </div>
              <Button
                onClick={openRequestDialog}
                className="rounded-full bg-[#C4A2B0] text-white hover:bg-[#C4A2B0]/90 px-7 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105 flex-shrink-0 self-stretch md:self-auto"
                data-testid="request-workshop-hero-btn"
              >
                Request a workshop <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-10 animate-fade-in-up delay-100">
          {upcomingWorkshops().map((w) => {
            const quantity = getQty(w.id);
            const lineTotal = (w.price * quantity).toFixed(2);
            return (
              <div
                key={w.id}
                className="bg-white border border-[#E5E0D6] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
                data-testid={`workshop-${w.id}`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] bg-[#F2F0EB] overflow-hidden">
                  <img
                    src={w.image}
                    alt={`${w.name} at ${w.place}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    data-testid={`workshop-image-${w.id}`}
                  />
                </div>

                {/* Details */}
                <div className="p-6 sm:p-8 flex flex-col">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-1">{w.name}</h2>
                      <div className="flex items-center gap-1.5 text-sm font-light" style={{ color: w.accent }}>
                        <MapPin size={14} />
                        <span>{w.place}</span>
                      </div>
                      {w.address && (
                        <p className="text-xs font-light text-[#9CA3AF] mt-0.5 ml-[22px]">{w.address}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-2xl font-light text-[#2C2C2C]">£{w.price}</span>
                      <span className="text-sm font-light text-[#6B7280]">/person</span>
                    </div>
                  </div>

                  {/* Date & Time Cards */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <div className="flex items-center gap-2 bg-[#F2F0EB] rounded-full px-4 py-2">
                      <Calendar size={14} className="text-[#8DA399]" />
                      <span className="text-sm font-light text-[#2C2C2C]">{w.date}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F2F0EB] rounded-full px-4 py-2">
                      <Clock size={14} className="text-[#8DA399]" />
                      <span className="text-sm font-light text-[#2C2C2C]">{w.time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F2F0EB] rounded-full px-4 py-2">
                      <span className="text-sm font-light text-[#2C2C2C]">Duration: {w.duration}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280] mb-6">{w.description}</p>

                  {/* Upcoming Dates Table */}
                  {w.upcomingDates && w.upcomingDates.length > 0 && (
                    <div className="mb-6 border border-[#E5E0D6] rounded-xl overflow-hidden">
                      <div className="bg-[#F2F0EB] px-4 py-2.5">
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Upcoming Dates</h3>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E5E0D6]">
                            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-[#9CA3AF]">Date</th>
                            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-[#9CA3AF]">Day</th>
                            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-[#9CA3AF]">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {w.upcomingDates.map((d, i) => (
                            <tr key={i} className={i < w.upcomingDates.length - 1 ? "border-b border-[#E5E0D6]" : ""}>
                              <td className="px-4 py-3 font-light text-[#2C2C2C]">{d.date}</td>
                              <td className="px-4 py-3 font-light text-[#6B7280]">{d.day}</td>
                              <td className="px-4 py-3 font-light text-[#6B7280]">{d.time || w.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

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

                  {/* Quantity selector (only for Stripe-bookable workshops) */}
                  {w.bookingType === "stripe" && (
                    <div className="flex items-center justify-between bg-[#F2F0EB]/60 rounded-xl px-4 py-3 mb-5" data-testid={`workshop-qty-${w.id}`}>
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Tickets</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQty(w.id, -1)}
                          disabled={quantity <= 1}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#F2F0EB]"
                          data-testid={`workshop-qty-minus-${w.id}`}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-base font-medium text-[#2C2C2C] min-w-[20px] text-center" data-testid={`workshop-qty-value-${w.id}`}>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(w.id, 1)}
                          disabled={quantity >= 10}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#F2F0EB]"
                          data-testid={`workshop-qty-plus-${w.id}`}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="text-sm font-light text-[#2C2C2C] ml-2">{quantity} {quantity === 1 ? "ticket" : "tickets"}</span>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto">
                    {w.bookingType === "external" && w.bookingUrl ? (
                      <a href={w.bookingUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105" data-testid={`book-workshop-${w.id}`}>
                          Book Now <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </a>
                    ) : w.bookingType === "stripe" ? (
                      <Button
                        onClick={() => handleBookClick(w)}
                        className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105"
                        data-testid={`book-workshop-${w.id}`}
                      >
                        Book Now <ArrowRight size={14} className="ml-2" />
                      </Button>
                    ) : (
                      <Button disabled className="rounded-full bg-[#E8E4D9] text-[#6B7280] px-8 py-6 text-xs uppercase tracking-widest cursor-not-allowed opacity-70" data-testid={`book-workshop-${w.id}`}>
                        Booking Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {false && (
          <>
            {/* Camp Beagle Raffle Section */}
            <div className="mt-16 animate-fade-in-up delay-150" data-testid="raffle-section">
              <div className="relative bg-white border border-[#E5E0D6] rounded-2xl overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#D4956A]/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#B8926A]/10 blur-2xl pointer-events-none" />
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1.2fr] items-center">
                  {/* Left: visual */}
                  <div className="p-8 sm:p-10 flex flex-col items-center text-center md:border-r border-[#E5E0D6]">
                    <div className="w-16 h-16 rounded-full bg-[#B8926A]/15 flex items-center justify-center mb-4">
                      <Heart size={28} strokeWidth={1.5} className="text-[#B8926A]" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#B8926A] mb-2">Charity Raffle</span>
                    <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-3">
                      Support Camp Beagle
                    </h2>
                    <div className="inline-flex items-center gap-2 bg-[#B8926A]/10 rounded-full px-4 py-2 mb-4">
                      <Ticket size={16} className="text-[#B8926A]" />
                      <span className="text-lg font-medium text-[#2C2C2C]">£2</span>
                      <span className="text-sm font-light text-[#6B7280]">per ticket</span>
                    </div>
                  </div>

                  {/* Right: info + CTA */}
                  <div className="p-8 sm:p-10">
                    <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280] mb-5">
                      Camp Beagle is a grassroots animal rights protest group — the longest-running animal rights camp in the UK, and globally. Since the summer of 2021 they have camped outside MBR Acres in peaceful protest, campaigning tirelessly to save the beagles bred for experimentation.
                    </p>
                    <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280] mb-6">
                      Everyone involved contributes their time, expertise, and dedication on a voluntary basis. All donations are used to cover the essential costs of running Camp Beagle and sustaining their campaign to shut down MBR Acres for good.
                    </p>

                    {/* Quantity selector */}
                    <div className="flex items-center justify-between bg-[#F2F0EB]/60 rounded-xl px-4 py-3 mb-5">
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Tickets</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRaffleQty((q) => Math.max(1, q - 1))}
                          disabled={raffleQty <= 1}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#F2F0EB]"
                          aria-label="Decrease raffle quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-base font-medium text-[#2C2C2C] min-w-[20px] text-center">{raffleQty}</span>
                        <button
                          type="button"
                          onClick={() => setRaffleQty((q) => Math.min(20, q + 1))}
                          disabled={raffleQty >= 20}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#2C2C2C] disabled:opacity-30 transition hover:bg-[#F2F0EB]"
                          aria-label="Increase raffle quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="text-sm font-light text-[#2C2C2C] ml-2">
                          {raffleQty} {raffleQty === 1 ? "ticket" : "tickets"} — £{(raffleQty * 2).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={openRaffleDialog}
                      className="rounded-full bg-[#B8926A] text-white hover:bg-[#B8926A]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105"
                      data-testid="raffle-buy-btn"
                    >
                      Buy Raffle Ticket{raffleQty > 1 ? "s" : ""} <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Guest / Login Dialog */}
      <Dialog open={!!guestDialog} onOpenChange={(v) => { if (!v) setGuestDialog(null); }}>
        <DialogContent className="max-w-sm border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl" data-testid="workshop-guest-dialog">
          <DialogTitle className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Before You Continue</DialogTitle>
          <DialogDescription className="text-sm font-light text-[#6B7280]">
            Sign in to save your booking to your account, or continue as a guest.
          </DialogDescription>
          <div className="mt-4 space-y-3">
            <Button
              onClick={handleGuestLogin}
              className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full transition-all hover:scale-105"
              data-testid="workshop-guest-login-btn"
            >
              Sign In / Create Account <ArrowRight size={14} className="ml-2" />
            </Button>
            <Button
              onClick={handleGuestContinue}
              variant="outline"
              className="rounded-full border-[#E5E0D6] text-[#6B7280] hover:text-[#2C2C2C] hover:border-[#2C2C2C] px-8 py-6 text-xs uppercase tracking-widest w-full transition-all"
              data-testid="workshop-guest-continue-btn"
            >
              Continue as Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={(open) => !submitting && setBookingOpen(open)}>
        <DialogContent className="bg-[#FAF9F6] max-w-md" data-testid="workshop-booking-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium">
              Book your spot
            </DialogTitle>
            {selectedWorkshop && (
              <DialogDescription className="text-sm font-light text-[#6B7280] pt-1">
                {selectedWorkshop.name} at {selectedWorkshop.place} - {selectedWorkshop.date}, {selectedWorkshop.time}
                <br />
                <span className="font-medium text-[#2C2C2C]">
                  {getQty(selectedWorkshop.id)} × £{selectedWorkshop.price} = £{(selectedWorkshop.price * getQty(selectedWorkshop.id)).toFixed(2)}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={submitBooking} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="wb-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Full Name</Label>
              <Input
                id="wb-name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Jane Doe"
                className="mt-1.5 bg-white border-[#E5E0D6]"
                required
                data-testid="workshop-booking-name"
              />
            </div>
            <div>
              <Label htmlFor="wb-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Email</Label>
              <Input
                id="wb-email"
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1.5 bg-white border-[#E5E0D6]"
                required
                data-testid="workshop-booking-email"
              />
            </div>
            <div>
              <Label htmlFor="wb-notes" className="text-xs uppercase tracking-widest text-[#6B7280]">
                Dietary / Access notes <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
              </Label>
              <Textarea
                id="wb-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value.slice(0, 500) })}
                placeholder="Let us know about any allergies, accessibility needs, or other requests..."
                className="mt-1.5 bg-white border-[#E5E0D6] min-h-[90px]"
                data-testid="workshop-booking-notes"
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{form.notes.length}/500</p>
            </div>
            {error && (
              <p className="text-sm text-red-500 font-light" data-testid="workshop-booking-error">{error}</p>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest"
              data-testid="workshop-booking-submit"
            >
              {submitting ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Redirecting to payment...</>
              ) : (
                <>Continue to payment <ArrowRight size={14} className="ml-2" /></>
              )}
            </Button>
            <p className="text-[10px] text-[#9CA3AF] text-center font-light">
              You'll be redirected to Stripe to complete your secure payment.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Your Own Workshop Dialog */}
      <Dialog open={requestOpen} onOpenChange={(open) => !requestSubmitting && setRequestOpen(open)}>
        <DialogContent className="bg-[#FAF9F6] max-w-md max-h-[90vh] overflow-y-auto" data-testid="request-workshop-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium">
              Request your own workshop
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280] pt-1">
              Hen do, baby shower, corporate away day, birthday... tell us about your event and we'll put a bespoke workshop together for you.
            </DialogDescription>
          </DialogHeader>

          {requestSuccess ? (
            <div className="text-center py-6 animate-fade-in-up" data-testid="request-workshop-success">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#8DA399]/15 mb-4">
                <CheckCircle2 size={28} strokeWidth={1.5} className="text-[#8DA399]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-2">Request received</h3>
              <p className="text-sm font-light text-[#6B7280] mb-6">
                Thanks {requestForm.full_name.split(" ")[0] || "lovely"}, we'll be in touch within 2 working days to design something just right.
              </p>
              <Button
                onClick={() => setRequestOpen(false)}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-5 text-xs uppercase tracking-widest"
                data-testid="request-workshop-close-btn"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="rw-event-type" className="text-xs uppercase tracking-widest text-[#6B7280]">Type of event</Label>
                <select
                  id="rw-event-type"
                  value={requestForm.event_type}
                  onChange={(e) => setRequestForm({ ...requestForm, event_type: e.target.value })}
                  className="mt-1.5 w-full appearance-none border border-[#E5E0D6] rounded-md px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399]"
                  required
                  data-testid="request-workshop-event-type"
                >
                  <option value="">Select event type...</option>
                  <option value="Bridal Party / Hen Do">Bridal Party / Hen Do</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Corporate Event / Away Day">Corporate Event / Away Day</option>
                  <option value="Team Social">Team Social</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Private Group">Private Group</option>
                  <option value="other">Something else</option>
                </select>
                {requestForm.event_type === "other" && (
                  <Input
                    type="text"
                    placeholder="Please specify..."
                    value={requestForm.event_type_other}
                    onChange={(e) => setRequestForm({ ...requestForm, event_type_other: e.target.value })}
                    className="mt-2 bg-white border-[#E5E0D6]"
                    data-testid="request-workshop-event-other"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="rw-city" className="text-xs uppercase tracking-widest text-[#6B7280]">City / Location</Label>
                <Input
                  id="rw-city"
                  value={requestForm.city}
                  onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })}
                  placeholder="e.g. London, Manchester, Edinburgh"
                  className="mt-1.5 bg-white border-[#E5E0D6]"
                  required
                  data-testid="request-workshop-city"
                />
              </div>

              <div>
                <Label htmlFor="rw-headcount" className="text-xs uppercase tracking-widest text-[#6B7280]">How many people?</Label>
                <Input
                  id="rw-headcount"
                  type="number"
                  min={1}
                  max={500}
                  value={requestForm.headcount}
                  onChange={(e) => setRequestForm({ ...requestForm, headcount: e.target.value })}
                  placeholder="e.g. 12"
                  className="mt-1.5 bg-white border-[#E5E0D6]"
                  required
                  data-testid="request-workshop-headcount"
                />
              </div>

              <div>
                <Label htmlFor="rw-date" className="text-xs uppercase tracking-widest text-[#6B7280]">
                  Preferred date <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
                </Label>
                <Input
                  id="rw-date"
                  type="date"
                  value={requestForm.preferred_date}
                  onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })}
                  className="mt-1.5 bg-white border-[#E5E0D6]"
                  data-testid="request-workshop-date"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rw-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Your name</Label>
                  <Input
                    id="rw-name"
                    value={requestForm.full_name}
                    onChange={(e) => setRequestForm({ ...requestForm, full_name: e.target.value })}
                    placeholder="Jane Doe"
                    className="mt-1.5 bg-white border-[#E5E0D6]"
                    required
                    data-testid="request-workshop-name"
                  />
                </div>
                <div>
                  <Label htmlFor="rw-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Email</Label>
                  <Input
                    id="rw-email"
                    type="email"
                    value={requestForm.email}
                    onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1.5 bg-white border-[#E5E0D6]"
                    required
                    data-testid="request-workshop-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rw-notes" className="text-xs uppercase tracking-widest text-[#6B7280]">
                  Anything else <span className="text-[10px] normal-case tracking-normal text-[#9CA3AF]">(optional)</span>
                </Label>
                <Textarea
                  id="rw-notes"
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value.slice(0, 800) })}
                  placeholder="Theme, time of day, dietary needs, venue ideas..."
                  className="mt-1.5 bg-white border-[#E5E0D6] min-h-[80px]"
                  data-testid="request-workshop-notes"
                />
                <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{requestForm.notes.length}/800</p>
              </div>

              {requestError && (
                <p className="text-sm text-red-500 font-light" data-testid="request-workshop-error">{requestError}</p>
              )}

              <Button
                type="submit"
                disabled={requestSubmitting}
                className="w-full rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest"
                data-testid="request-workshop-submit"
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

      {/* Raffle Checkout Dialog */}
      <Dialog open={false && raffleOpen} onOpenChange={(open) => !raffleSubmitting && setRaffleOpen(open)}>
        <DialogContent className="bg-[#FAF9F6] max-w-md border-[#E5E0D6] rounded-2xl" data-testid="raffle-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium">
              Camp Beagle Raffle
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280] pt-1">
              {raffleQty} {raffleQty === 1 ? "ticket" : "tickets"} — <span className="font-medium text-[#2C2C2C]">£{(raffleQty * 2).toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitRaffle} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="raffle-name" className="text-xs uppercase tracking-widest text-[#6B7280]">Full Name</Label>
              <Input
                id="raffle-name"
                value={raffleForm.full_name}
                onChange={(e) => setRaffleForm({ ...raffleForm, full_name: e.target.value })}
                placeholder="Jane Doe"
                className="mt-1.5 bg-white border-[#E5E0D6]"
                required
                data-testid="raffle-name"
              />
            </div>
            <div>
              <Label htmlFor="raffle-email" className="text-xs uppercase tracking-widest text-[#6B7280]">Email</Label>
              <Input
                id="raffle-email"
                type="email"
                value={raffleForm.email}
                onChange={(e) => setRaffleForm({ ...raffleForm, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1.5 bg-white border-[#E5E0D6]"
                required
                data-testid="raffle-email"
              />
            </div>
            {raffleError && (
              <p className="text-sm text-red-500 font-light" data-testid="raffle-error">{raffleError}</p>
            )}
            <Button
              type="submit"
              disabled={raffleSubmitting}
              className="w-full rounded-full bg-[#B8926A] text-white hover:bg-[#B8926A]/90 px-8 py-6 text-xs uppercase tracking-widest"
              data-testid="raffle-submit"
            >
              {raffleSubmitting ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Redirecting to payment...</>
              ) : (
                <>Continue to payment <ArrowRight size={14} className="ml-2" /></>
              )}
            </Button>
            <p className="text-[10px] text-[#9CA3AF] text-center font-light">
              You'll be redirected to Stripe to complete your £{(raffleQty * 2).toFixed(2)} payment. Your unique raffle ticket number(s) will be included in your receipt.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
