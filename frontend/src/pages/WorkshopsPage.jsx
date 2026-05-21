import { useState } from "react";
import { Calendar, Clock, MapPin, Gift, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WORKSHOPS = [
  {
    id: "kings-dog-daycare-2026-05-30",
    name: "Flower Arranging Workshop",
    place: "King's Dog Daycare",
    date: "30 May 2026",
    time: "1pm",
    duration: "60-90 mins",
    price: 35,
    description: "Relax with dogs and enjoy a creative afternoon of flower arranging. Whether you're a complete beginner or just looking for something different, this laid-back workshop is for you. Bring your furry friend along and make something beautiful together. All levels welcome - come meet like-minded people and leave with a gorgeous bouquet. Duration: 60-90mins.",
    included: ["Your bouquet to take home", "x1 drink included", "Doggy treat cup if you bring a furry friend"],
    accent: "#B8926A",
    image: "https://lh3.googleusercontent.com/d/1KFiaKmLQZKWllAd7tHnDWxyzKeV_75Or=w800",
    bookingType: "external",
    bookingUrl: "https://kingsdogdaycare.replit.app/events/1",
    status: "live",
  },
  {
    id: "cat-titude-2026-06-19",
    name: "Flower Arranging Workshop",
    place: "Cat-titude Cat Cafe",
    date: "19 June 2026",
    time: "6pm",
    duration: "60-90 mins",
    price: 35,
    description: "Enjoy a creative evening surrounded by cats at the cosiest cafe in town. Unwind after work, learn to arrange a beautiful pet-safe bouquet, and soak up the calm vibes. All levels welcome - no experience needed, just come ready to relax and meet like-minded people. Duration: 60-90mins.",
    included: ["Your bouquet to take home", "Prosecco (+£10 add-on)", "Cat Play time"],
    accent: "#C4A2B0",
    image: "https://lh3.googleusercontent.com/d/1KFiaKmLQZKWllAd7tHnDWxyzKeV_75Or=w800",
    bookingType: "pending",
    bookingUrl: null,
    status: "pending",
  },
  {
    id: "paws-cat-cafe-2026-06-26",
    name: "Flower Arranging Workshop",
    place: "Paws Cat Café",
    date: "26 June 2026",
    time: "6pm",
    duration: "60-90 mins",
    price: 45,
    description: "Spend a relaxed evening at Paws Cat Café arranging your own pet-safe bouquet while playing with the resident cats. Sip on a complimentary drink and let your creativity flow in this charming, calming setting. All levels welcome. Duration: 60-90mins.",
    included: ["Your bouquet to take home", "Free drink included", "Cat Play time"],
    accent: "#8DA399",
    image: "https://lh3.googleusercontent.com/d/1KFiaKmLQZKWllAd7tHnDWxyzKeV_75Or=w800",
    bookingType: "stripe",
    bookingUrl: null,
    status: "live",
  },
];

export default function WorkshopsPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [form, setForm] = useState({ full_name: "", customer_email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openStripeBooking = (workshop) => {
    setSelectedWorkshop(workshop);
    setForm({ full_name: "", customer_email: "", notes: "" });
    setError("");
    setBookingOpen(true);
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
      const res = await fetch(`${API}/workshops/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshop_id: selectedWorkshop.id,
          workshop_name: selectedWorkshop.name,
          workshop_location: selectedWorkshop.place,
          workshop_date: selectedWorkshop.date,
          workshop_time: selectedWorkshop.time,
          price: selectedWorkshop.price,
          full_name: form.full_name.trim(),
          customer_email: form.customer_email.trim(),
          notes: form.notes.trim(),
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

        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Workshops</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Upcoming Workshops
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Learn to arrange beautiful, pet-safe flowers in a fun and relaxed setting. No experience needed - just come ready to create.
          </p>
        </div>

        <div className="space-y-10 animate-fade-in-up delay-100">
          {WORKSHOPS.map((w) => (
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
                <div className="mt-auto">
                  {w.bookingType === "external" && w.bookingUrl ? (
                    <a href={w.bookingUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105" data-testid={`book-workshop-${w.id}`}>
                        Book Now <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </a>
                  ) : w.bookingType === "stripe" ? (
                    <Button
                      onClick={() => openStripeBooking(w)}
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
          ))}
        </div>
      </div>

      {/* Stripe Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={(open) => !submitting && setBookingOpen(open)}>
        <DialogContent className="bg-[#FAF9F6] max-w-md" data-testid="workshop-booking-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] font-medium">
              Book your spot
            </DialogTitle>
            {selectedWorkshop && (
              <DialogDescription className="text-sm font-light text-[#6B7280] pt-1">
                {selectedWorkshop.name} at {selectedWorkshop.place} - {selectedWorkshop.date}, {selectedWorkshop.time} - £{selectedWorkshop.price}
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
    </div>
  );
}
