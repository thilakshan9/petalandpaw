import { useState } from "react";
import { Mail, MapPin, Clock, Send, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="contact-page">
      <SEOHead title="Contact" description="Get in touch with Petal & Paw. We'd love to hear from you." />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">

        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Get In Touch</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Have a question about our flowers, a custom order, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 animate-fade-in-up delay-100">
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "hello@petalandpaw.co.uk", href: "mailto:hello@petalandpaw.co.uk" },
                { icon: Instagram, label: "Instagram", value: "@petalandpawflorist", href: "https://instagram.com/petalandpawflorist" },
                { icon: MapPin, label: "Location", value: "United Kingdom" },
                { icon: Clock, label: "Response Time", value: "Within 24 hours" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 p-4 bg-white border border-[#E5E0D6] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#F2F0EB] flex items-center justify-center flex-shrink-0">
                    <Icon size={18} strokeWidth={1.5} className="text-[#8DA399]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm font-light text-[#2C2C2C] hover:text-[#8DA399] transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm font-light text-[#2C2C2C]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 animate-fade-in-up delay-200">
            <form onSubmit={handleSubmit} className="bg-white border border-[#E5E0D6] rounded-2xl p-5 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="border-[#E5E0D6] text-sm py-5"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="border-[#E5E0D6] text-sm py-5"
                    data-testid="contact-email"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Subject</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What's this about?"
                  className="border-[#E5E0D6] text-sm py-5"
                  data-testid="contact-subject"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="w-full rounded-md border border-[#E5E0D6] bg-transparent px-3 py-3 text-sm font-light placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-1 focus:ring-[#8DA399] resize-none"
                  data-testid="contact-message"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-[1.02] w-full sm:w-auto"
                data-testid="contact-submit"
              >
                {sending ? "Sending..." : <>Send Message <Send size={14} className="ml-2" /></>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
