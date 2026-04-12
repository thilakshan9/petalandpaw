import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
          return;
        }
        if (data.status === "expired") {
          setStatus("expired");
          return;
        }
        // For subscriptions, "complete" status means success
        if (data.status === "complete" && data.mode === "subscription") {
          setStatus("success");
          clearCart();
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          // If we've polled enough and it's still not paid, show success anyway
          // (Stripe may take a moment to process)
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

  const isSubscription = paymentData?.mode === "subscription";

  return (
    <div className="py-16 sm:py-20 md:py-32" data-testid="checkout-success-page">
      <div className="container mx-auto px-5 md:px-8 max-w-lg text-center">
        {status === "loading" && (
          <div className="animate-fade-in-up">
            <Loader2 size={48} strokeWidth={1} className="mx-auto text-[#8DA399] animate-spin mb-6" />
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-4">Processing Payment</h1>
            <p className="text-sm sm:text-base font-light text-[#6B7280]">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in-up">
            <CheckCircle2 size={48} strokeWidth={1} className="mx-auto text-[#8DA399] mb-6" />
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-4" data-testid="payment-success-title">
              Thank You!
            </h1>
            <p className="text-sm sm:text-base font-light text-[#6B7280] mb-2">
              {isSubscription
                ? "Your subscription has been set up. You'll be charged monthly."
                : "Your order has been confirmed and is being prepared with care."
              }
            </p>
            {paymentData?.amount_total && (
              <p className="text-sm font-light text-[#6B7280] mb-2">
                Amount: £{(paymentData.amount_total / 100).toFixed(2)}
                {isSubscription && " / month"}
              </p>
            )}
            {paymentData?.shipping && (
              <div className="bg-[#F2F0EB] rounded-xl p-4 mt-4 mb-2 text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2">Shipping to</p>
                <p className="text-sm font-light text-[#2C2C2C]">{paymentData.shipping.name}</p>
                <p className="text-sm font-light text-[#6B7280]">
                  {[paymentData.shipping.address?.line1, paymentData.shipping.address?.line2, paymentData.shipping.address?.city, paymentData.shipping.address?.postal_code].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            <p className="text-xs font-light text-[#8DA399] mb-8">A confirmation has been sent to your email.</p>
            <Link to="/">
              <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs sm:text-sm uppercase tracking-widest" data-testid="back-to-home-btn">
                Back to Home
              </Button>
            </Link>
          </div>
        )}

        {(status === "error" || status === "expired" || status === "timeout") && (
          <div className="animate-fade-in-up">
            <XCircle size={48} strokeWidth={1} className="mx-auto text-red-400 mb-6" />
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-4">
              {status === "timeout" ? "Payment Pending" : "Payment Issue"}
            </h1>
            <p className="text-sm sm:text-base font-light text-[#6B7280] mb-8">
              {status === "timeout"
                ? "Your payment is still being processed. Check your email for confirmation."
                : "Something went wrong. Please contact us if you were charged."}
            </p>
            <Link to="/contact">
              <Button variant="outline" className="rounded-full border-[#2C2C2C] text-[#2C2C2C] px-8 py-6 text-xs sm:text-sm uppercase tracking-widest">
                Contact Us
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
