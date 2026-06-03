import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, Calendar, MapPin, Clock, Mail, ArrowRight, Sparkles, Gift, Ticket, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading");
  const [paymentData, setPaymentData] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    let attempts = 0;
    const maxAttempts = 8;
    const pollInterval = 2000;

    const poll = async () => {
      try {
        const res = await fetch(`${API}/orders/status/${sessionId}`);
        if (!res.ok) {
          attempts++;
          if (attempts < maxAttempts) { setTimeout(poll, pollInterval); return; }
          setStatus("error");
          return;
        }
        const data = await res.json();
        setPaymentData(data);

        if (data.payment_status === "paid") {
          setStatus("success");
          clearCart();
          localStorage.removeItem("pp_pending_stripe_item");
          return;
        }
        if (data.status === "expired") {
          setStatus("expired");
          return;
        }
        if (data.status === "complete" && data.mode === "subscription") {
          setStatus("success");
          clearCart();
          localStorage.removeItem("pp_pending_stripe_item");
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          if (data.status === "complete") {
            setStatus("success");
            clearCart();
          } else {
            setStatus("timeout");
          }
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setStatus("error");
        }
      }
    };

    poll();
  }, [sessionId, clearCart]);

  const meta = paymentData?.metadata || {};
  const booking = paymentData?.booking;
  const voucher = paymentData?.voucher;
  const redemption = paymentData?.redemption;
  const isVoucher = meta?.type === "voucher" || !!voucher;
  const isRedemption = meta?.type === "voucher_redemption" || !!redemption;
  const isWorkshop = !isVoucher && !isRedemption && (meta?.type === "workshop" || !!booking);
  const isSubscription = !isVoucher && !isRedemption && paymentData?.mode === "subscription";

  const [voucherCopied, setVoucherCopied] = useState(false);
  const copyVoucher = async () => {
    if (!voucher?.code) return;
    try {
      await navigator.clipboard.writeText(voucher.code);
      setVoucherCopied(true);
      setTimeout(() => setVoucherCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-[80vh] py-12 sm:py-20 md:py-28" data-testid="checkout-success-page">
      <div className="container mx-auto px-5 md:px-8 max-w-2xl">
        {status === "loading" && (
          <div className="text-center animate-fade-in-up bg-white border border-[#E5E0D6] rounded-3xl p-10 sm:p-16">
            <Loader2 size={48} strokeWidth={1} className="mx-auto text-[#8DA399] animate-spin mb-6" />
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-3">
              Confirming your payment
            </h1>
            <p className="text-sm sm:text-base font-light text-[#6B7280]">
              Just a moment while we wrap things up...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in-up">
            {/* Hero Confirmation Card */}
            <div className="relative bg-white border border-[#E5E0D6] rounded-3xl p-8 sm:p-12 overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#8DA399]/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#C4A2B0]/10 blur-2xl" />

              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8DA399]/15 mb-6">
                  <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#8DA399]" />
                </div>

                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 block">
                  {isVoucher ? "Voucher Issued" : isRedemption ? "Booking Confirmed" : isWorkshop ? "Booking Confirmed" : isSubscription ? "Subscription Active" : "Order Confirmed"}
                </span>
                <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4" data-testid="payment-success-title">
                  {isVoucher
                    ? "Your voucher is ready"
                    : isRedemption
                      ? "Workshops booked using voucher"
                      : isWorkshop
                        ? "You're booked in!"
                        : isSubscription
                          ? "Welcome to the family"
                          : "Thank you"}
                </h1>
                <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] max-w-md mx-auto">
                  {isVoucher
                    ? `${voucher?.recipient_email ? "We've emailed the voucher to your recipient. A copy is in your inbox too." : "We've emailed your voucher code. Use it any time on our workshops page."}`
                    : isRedemption
                      ? `Your voucher covered £${Number(redemption?.voucher_applied || 0).toFixed(2)}${Number(redemption?.excess || 0) > 0 ? ` and you topped up £${Number(redemption?.excess).toFixed(2)}` : ""}. Confirmation emails are on the way.`
                      : isWorkshop
                        ? `${booking?.full_name ? booking.full_name.split(" ")[0] + ", we" : "We"} can't wait to see you. A confirmation with all the details has been sent to your email.`
                        : isSubscription
                          ? "Your subscription is all set up. Look out for your first bouquet soon - we'll be in touch."
                          : "Your order has been confirmed and is being prepared with care. A receipt is on its way to your inbox."}
                </p>

                {paymentData?.amount_total && (
                  <div className="inline-flex items-baseline gap-2 mt-6 px-5 py-2 rounded-full bg-[#F2F0EB]">
                    <span className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold">Total</span>
                    <span className="text-lg font-light text-[#2C2C2C]">
                      £{(paymentData.amount_total / 100).toFixed(2)}
                    </span>
                    {isSubscription && <span className="text-xs text-[#6B7280]">/month</span>}
                  </div>
                )}
              </div>

              {/* Voucher details panel */}
              {isVoucher && voucher && (
                <div className="relative mt-8 pt-8 border-t border-[#E5E0D6]" data-testid="voucher-details-card">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-4 text-center flex items-center justify-center gap-2">
                    <Gift size={12} className="text-[#C4A2B0]" /> Voucher Code
                  </h3>
                  <div className="bg-gradient-to-br from-[#F2F0EB] to-[#FAF9F6] border border-[#E5E0D6] rounded-2xl p-6 text-center">
                    <p className="font-['Playfair_Display'] text-3xl sm:text-4xl font-medium text-[#2C2C2C] mb-3">
                      £{Number(voucher.original_amount || 0).toFixed(2)}
                    </p>
                    <button
                      onClick={copyVoucher}
                      className="font-mono text-base sm:text-lg tracking-[0.25em] text-[#2C2C2C] hover:text-[#8DA399] transition-colors inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#E5E0D6]"
                      data-testid="success-voucher-code"
                    >
                      {voucher.code}
                      {voucherCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Voucher redemption details */}
              {isRedemption && redemption && (
                <div className="relative mt-8 pt-8 border-t border-[#E5E0D6]" data-testid="redemption-details-card">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-4 text-center flex items-center justify-center gap-2">
                    <Ticket size={12} className="text-[#8DA399]" /> Bookings via voucher {redemption.voucher_code}
                  </h3>
                  <div className="space-y-2">
                    {redemption.items?.map((it, i) => (
                      <div key={i} className="bg-[#F2F0EB]/70 rounded-xl px-4 py-3 flex items-center justify-between text-sm font-light">
                        <span className="text-[#2C2C2C]">{it.workshop_location} - {it.workshop_date}</span>
                        <span className="text-[#6B7280]">{it.quantity} × £{(Number(it.line_total) / Math.max(1, it.quantity)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-light">
                    <div className="bg-[#F2F0EB]/70 rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold">Voucher applied</p>
                      <p className="text-[#8DA399] font-medium">£{Number(redemption.voucher_applied || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#F2F0EB]/70 rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold">Top-up paid</p>
                      <p className="text-[#2C2C2C] font-medium">£{Number(redemption.excess || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Workshop details panel */}
              {isWorkshop && booking && (
                <div className="relative mt-8 pt-8 border-t border-[#E5E0D6]" data-testid="booking-details-card">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-4 text-center">Your Workshop</h3>
                  <p className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] text-center mb-5">
                    {booking.workshop_name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2.5 bg-[#F2F0EB]/70 rounded-xl px-4 py-3">
                      <MapPin size={14} className="text-[#8DA399] flex-shrink-0" />
                      <span className="text-sm font-light text-[#2C2C2C]">{booking.workshop_location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-[#F2F0EB]/70 rounded-xl px-4 py-3">
                      <Calendar size={14} className="text-[#8DA399] flex-shrink-0" />
                      <span className="text-sm font-light text-[#2C2C2C]">{booking.workshop_date}</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-[#F2F0EB]/70 rounded-xl px-4 py-3">
                      <Clock size={14} className="text-[#8DA399] flex-shrink-0" />
                      <span className="text-sm font-light text-[#2C2C2C]">{booking.workshop_time}</span>
                    </div>
                  </div>
                  {booking.customer_email && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs font-light text-[#6B7280]">
                      <Mail size={12} className="text-[#8DA399]" />
                      <span>Confirmation sent to <strong className="font-medium text-[#2C2C2C]">{booking.customer_email}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Subscription preferred delivery date */}
              {isSubscription && meta.preferred_delivery_date && (
                <div className="relative mt-8 pt-8 border-t border-[#E5E0D6]">
                  <div className="flex items-center justify-center gap-2 text-sm font-light text-[#6B7280]">
                    <Calendar size={14} className="text-[#8DA399]" />
                    <span>Preferred delivery date: <strong className="font-medium text-[#2C2C2C]">{meta.preferred_delivery_date}</strong></span>
                  </div>
                </div>
              )}

              {/* Shipping panel */}
              {paymentData?.shipping && !isWorkshop && (
                <div className="relative mt-8 pt-8 border-t border-[#E5E0D6]">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-3 text-center">Shipping to</h3>
                  <p className="text-sm font-light text-[#2C2C2C] text-center">{paymentData.shipping.name}</p>
                  <p className="text-sm font-light text-[#6B7280] text-center">
                    {[paymentData.shipping.address?.line1, paymentData.shipping.address?.line2, paymentData.shipping.address?.city, paymentData.shipping.address?.postal_code].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Link to="/">
                <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs sm:text-sm uppercase tracking-widest w-full sm:w-auto transition-all hover:scale-105" data-testid="back-to-home-btn">
                  Back to Home <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
              {isVoucher ? (
                <Link to="/workshops">
                  <Button variant="outline" className="rounded-full border-[#8DA399] text-[#8DA399] hover:bg-[#8DA399] hover:text-white px-8 py-6 text-xs sm:text-sm uppercase tracking-widest w-full sm:w-auto transition-all">
                    Browse workshops
                  </Button>
                </Link>
              ) : isRedemption || isWorkshop ? (
                <Link to="/workshops">
                  <Button variant="outline" className="rounded-full border-[#8DA399] text-[#8DA399] hover:bg-[#8DA399] hover:text-white px-8 py-6 text-xs sm:text-sm uppercase tracking-widest w-full sm:w-auto transition-all">
                    Explore more workshops
                  </Button>
                </Link>
              ) : (
                <Link to="/account">
                  <Button variant="outline" className="rounded-full border-[#8DA399] text-[#8DA399] hover:bg-[#8DA399] hover:text-white px-8 py-6 text-xs sm:text-sm uppercase tracking-widest w-full sm:w-auto transition-all">
                    View my orders
                  </Button>
                </Link>
              )}
            </div>

            {/* Sweet brand sign-off */}
            <div className="text-center mt-10 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8DA399]">
              <Sparkles size={12} />
              <span>Petal & Paw - Pet-Safe Florals</span>
              <Sparkles size={12} />
            </div>
          </div>
        )}

        {(status === "error" || status === "expired" || status === "timeout") && (
          <div className="bg-white border border-[#E5E0D6] rounded-3xl p-10 sm:p-14 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
              <XCircle size={32} strokeWidth={1.5} className="text-red-400" />
            </div>
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-4">
              {status === "timeout" ? "Payment Pending" : "Payment Issue"}
            </h1>
            <p className="text-sm sm:text-base font-light text-[#6B7280] mb-8 max-w-md mx-auto">
              {status === "timeout"
                ? "Your payment is still being processed. Check your email for confirmation - we'll be in touch shortly."
                : "Something went wrong. Please contact us if you were charged and we'll sort it right out."}
            </p>
            <Link to="/contact">
              <Button variant="outline" className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white px-8 py-6 text-xs sm:text-sm uppercase tracking-widest transition-all">
                Contact Us
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
