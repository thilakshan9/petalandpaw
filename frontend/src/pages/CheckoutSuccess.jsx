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
    const maxAttempts = 5;
    const pollInterval = 2000;

    const poll = async () => {
      try {
        const res = await fetch(`${API}/orders/status/${sessionId}`);
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

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setStatus("timeout");
        }
      } catch {
        setStatus("error");
      }
    };

    poll();
  }, [sessionId, clearCart]);

  return (
    <div className="py-20 md:py-32" data-testid="checkout-success-page">
      <div className="container mx-auto px-4 md:px-8 max-w-lg text-center">
        {status === "loading" && (
          <div className="animate-fade-in-up">
            <Loader2 size={48} strokeWidth={1} className="mx-auto text-[#8DA399] animate-spin mb-6" />
            <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-4">Processing Payment</h1>
            <p className="text-base font-light text-[#6B7280]">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in-up">
            <CheckCircle2 size={48} strokeWidth={1} className="mx-auto text-[#8DA399] mb-6" />
            <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-4" data-testid="payment-success-title">Thank You!</h1>
            <p className="text-base font-light text-[#6B7280] mb-2">Your order has been confirmed.</p>
            {paymentData && (
              <p className="text-sm font-light text-[#6B7280] mb-8">
                Amount: £{(paymentData.amount_total / 100).toFixed(2)}
              </p>
            )}
            <Link to="/shop">
              <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest" data-testid="back-to-shop-btn">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}

        {(status === "error" || status === "expired" || status === "timeout") && (
          <div className="animate-fade-in-up">
            <XCircle size={48} strokeWidth={1} className="mx-auto text-red-400 mb-6" />
            <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-4">
              {status === "timeout" ? "Payment Pending" : "Payment Issue"}
            </h1>
            <p className="text-base font-light text-[#6B7280] mb-8">
              {status === "timeout"
                ? "Your payment is still being processed. Check your email for confirmation."
                : "Something went wrong. Please contact support if you were charged."}
            </p>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full border-[#2C2C2C] text-[#2C2C2C] px-8 py-6 text-sm uppercase tracking-widest">
                Back to Shop
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
