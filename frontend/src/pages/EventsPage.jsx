import { useState } from "react";
import { Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EventsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", floral_style: "", budget: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Event Enquiry - ${form.event_type || "General"}${form.date ? ` (${form.date})` : ""}`,
          message: `Phone: ${form.phone || "Not provided"}\nEvent Type: ${form.event_type || "Not specified"}\nDate & Time: ${form.date || "TBC"}\nEstimated Guests: ${form.guests || "Not specified"}\nFloral Style/Theme: ${form.floral_style || "Not specified"}\nBudget: ${form.budget || "Not specified"}\n\n${form.message}`,
        }),
      });
      if (res.ok) {
        toast.success("Enquiry sent! We'll be in touch soon.");
        setForm({ name: "", email: "", phone: "", event_type: "", date: "", guests: "", floral_style: "", budget: "", message: "" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setSending(false);
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="events-page">
      <SEOHead title="Events" description="Beautiful pet-safe flowers for your special occasions. Weddings, birthdays, corporate events and more." />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">

        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Events</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Flowers for Every Occasion
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            From intimate gatherings to larger celebrations, we create beautiful arrangements tailored to your event - all with the same care and attention we put into every bouquet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 max-w-5xl mx-auto">

          <div className="animate-fade-in-up delay-100 space-y-8">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">What We Offer</h2>
              <ul className="space-y-3 text-sm sm:text-base font-light text-[#6B7280]">
                <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-0.5">-</span> Table centrepieces and arrangements</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-0.5">-</span> Welcome displays and entrance flowers</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-0.5">-</span> Bridal and bridesmaid bouquets</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-0.5">-</span> Birthday and celebration flowers</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-0.5">-</span> Corporate event florals</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] mt-0.5">-</span> Pet-safe options available on request</li>
              </ul>
            </div>

            <div className="bg-[#F2F0EB]/60 rounded-2xl p-6">
              <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] mb-2">How It Works</h3>
              <ol className="space-y-2 text-sm font-light text-[#6B7280]">
                <li className="flex items-start gap-2"><span className="text-[#8DA399] font-semibold">1.</span> Fill in the enquiry form with your details</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] font-semibold">2.</span> We'll get back to you within 24 hours</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] font-semibold">3.</span> We'll discuss your vision and create a custom quote</li>
                <li className="flex items-start gap-2"><span className="text-[#8DA399] font-semibold">4.</span> Sit back and let us handle the flowers</li>
              </ol>
            </div>
          </div>

          <div className="animate-fade-in-up delay-200">
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8">
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-1">Get in Touch</h2>
              <p className="text-sm font-light text-[#6B7280] mb-6">Tell us about your event and we'll come back with ideas.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="border-[#E5E0D6] text-sm"
                      data-testid="events-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Email *</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="border-[#E5E0D6] text-sm"
                      data-testid="events-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Your phone number"
                    className="border-[#E5E0D6] text-sm"
                    data-testid="events-phone"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">What type of event are you planning?</label>
                  <Input
                    value={form.event_type}
                    onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                    placeholder="e.g. Wedding, Birthday, Corporate"
                    className="border-[#E5E0D6] text-sm"
                    data-testid="events-type"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">What is the date and time of your event?</label>
                  <Input
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="e.g. 15th June 2026, 2pm"
                    className="border-[#E5E0D6] text-sm"
                    data-testid="events-date"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Approximately how many guests will be attending?</label>
                  <Input
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    placeholder="e.g. 50"
                    className="border-[#E5E0D6] text-sm"
                    data-testid="events-guests"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">What is your preferred floral style or theme?</label>
                  <Input
                    value={form.floral_style}
                    onChange={(e) => setForm({ ...form, floral_style: e.target.value })}
                    placeholder="e.g. Rustic, Romantic, Modern, Wildflower"
                    className="border-[#E5E0D6] text-sm"
                    data-testid="events-style"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">What is your estimated budget for flowers and decor?</label>
                  <Input
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g. £200 - £500"
                    className="border-[#E5E0D6] text-sm"
                    data-testid="events-budget"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Anything else you'd like us to know?</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Any additional details, colour preferences, pet-safe requirements..."
                    rows={4}
                    className="w-full border border-[#E5E0D6] rounded-md px-3 py-2 text-sm font-light text-[#2C2C2C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#8DA399] resize-none"
                    data-testid="events-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-8 py-6 text-xs uppercase tracking-widest w-full transition-all hover:scale-105"
                  data-testid="events-submit"
                >
                  {sending ? "Sending..." : "Send Enquiry"} <Send size={14} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
