import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, CalendarDays, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem("petal-paw-referral") || "");
  const [referralValid, setReferralValid] = useState(null);
  const [checking, setChecking] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState("");

  const validateReferral = async () => {
    if (!referralCode.trim()) { setReferralValid(null); return; }
    setChecking(true);
    try {
      const res = await fetch(`${API}/referral/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode }),
      });
      if (res.ok) {
        const data = await res.json();
        setReferralValid(data);
        toast.success(`£${data.discount} discount from ${data.referrer_name}!`);
      } else {
        setReferralValid(false);
        toast.error("Invalid referral code.");
      }
    } catch { setReferralValid(false); }
    setChecking(false);
  };

  const discount = referralValid && referralValid.valid ? referralValid.discount : 0;
  const delivery = total >= 50 ? 0 : 5.99;
  const finalTotal = Math.max(0.01, total + delivery - discount);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    const themedItems = items.filter((i) => i.theme);
    const label = (t) => (t === "christmas" ? "Christmas" : "Halloween");
    const specialNotes = themedItems.length
      ? themedItems.map((i) => `${label(i.theme)}: ${i.name}${i.season_date ? ` (deliver ${i.season_date})` : ""}`).join("; ")
      : "";
    const seasonDate = (themedItems.find((i) => i.season_date) || {}).season_date || "";
    const finalDeliveryDate = deliveryDate ? deliveryDate.toISOString().split("T")[0] : seasonDate;
    try {
      const res = await fetch(`${API}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id, name: i.name, price: i.price,
            quantity: i.quantity, image_url: i.image_url || "",
          })),
          origin_url: window.location.origin, order_type: "regular",
          delivery_date: finalDeliveryDate,
          referral_code: referralValid?.valid ? referralCode : "",
          personalized_message: personalizedMessage,
          special_notes: specialNotes,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error("Failed to create checkout session.");
    } catch { toast.error("Something went wrong."); }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 md:py-32" data-testid="cart-page-empty">
        <SEOHead title="Cart" />
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
          <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-[#E5E0D6] mb-6" />
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#2C2C2C] mb-4">Your cart is empty</h1>
          <p className="text-base font-light text-[#6B7280] mb-8">Time to find something beautiful for your home.</p>
          <Link to="/shop">
            <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest" data-testid="continue-shopping-btn">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="cart-page">
      <SEOHead title="Cart" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">
        <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-6 sm:mb-10 animate-fade-in-up">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="flex gap-4 md:gap-6 bg-white border border-[#E5E0D6] rounded-xl p-4 md:p-6 animate-fade-in-up" data-testid={`cart-item-${item.product_id}`}>
                {item.image_url && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#F2F0EB] flex-shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] truncate">{item.name}</h3>
                  <p className="text-sm font-light text-[#6B7280] mt-1">£{item.price.toFixed(2)} each</p>
                  {item.theme && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: item.theme === "christmas" ? "rgba(46,93,63,0.1)" : "rgba(107,78,113,0.1)", color: item.theme === "christmas" ? "#1E3D2A" : "#4A3550" }} data-testid={`cart-halloween-tag-${item.product_id}`}>
                      {item.theme === "christmas" ? "🎄 Christmas" : "🎃 Halloween"}{item.season_date ? ` · deliver ${item.season_date}` : ""}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[#E5E0D6] rounded-full">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2 hover:bg-[#F2F0EB] rounded-l-full transition-colors" data-testid={`cart-decrease-${item.product_id}`}><Minus size={12} /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2 hover:bg-[#F2F0EB] rounded-r-full transition-colors" data-testid={`cart-increase-${item.product_id}`}><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="p-2 text-[#6B7280] hover:text-red-500 transition-colors" data-testid={`cart-remove-${item.product_id}`}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="text-right"><p className="text-lg font-light text-[#2C2C2C]">£{(item.price * item.quantity).toFixed(2)}</p></div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 md:p-8 sticky top-24 space-y-6">
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Order Summary</h3>

              {/* Delivery Date */}
              <div data-testid="delivery-date-section">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Delivery Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-light border-[#E5E0D6] rounded-lg" data-testid="delivery-date-btn">
                      <CalendarDays size={14} className="mr-2 text-[#8DA399]" />
                      {deliveryDate ? deliveryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      disabled={(date) => date < new Date() || date < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Referral Code */}
              <div data-testid="referral-code-section">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Referral Code</label>
                <div className="flex gap-2">
                  <Input value={referralCode} onChange={(e) => { setReferralCode(e.target.value); setReferralValid(null); }} placeholder="Enter code" className="border-[#E5E0D6] text-sm" data-testid="referral-input" />
                  <Button variant="outline" onClick={validateReferral} disabled={checking} className="border-[#E5E0D6] px-4 flex-shrink-0" data-testid="apply-referral-btn">
                    <Tag size={14} />
                  </Button>
                </div>
                {referralValid === false && <p className="text-xs text-red-400 mt-1">Invalid code</p>}
                {referralValid?.valid && <p className="text-xs text-[#8DA399] mt-1">-£{referralValid.discount.toFixed(2)} discount applied</p>}
              </div>

              {/* Personalized Message */}
              <div data-testid="personalized-message-section">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-2 block">Personalized Message</label>
                <textarea
                  placeholder="Add a personal note to your bouquet..."
                  value={personalizedMessage}
                  onChange={(e) => setPersonalizedMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full border border-[#E5E0D6] rounded-lg px-3 py-2 text-sm font-light text-[#2C2C2C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#8DA399] resize-none"
                  data-testid="cart-personalized-message-input"
                />
                <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{personalizedMessage.length}/500</p>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-2 border-t border-[#E5E0D6]">
                <div className="flex justify-between text-sm font-light text-[#6B7280]">
                  <span>Subtotal</span><span>£{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-light text-[#6B7280]">
                  <span>Delivery</span><span>{delivery === 0 ? "Free" : `£${delivery.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-light text-[#8DA399]">
                    <span>Referral discount</span><span>-£{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#E5E0D6] pt-3 flex justify-between">
                  <span className="text-base font-medium text-[#2C2C2C]">Total</span>
                  <span className="text-base font-medium text-[#2C2C2C]" data-testid="cart-total">£{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              {total < 50 && <p className="text-xs font-light text-[#8DA399]">Add £{(50 - total).toFixed(2)} more for free delivery</p>}
              <Button onClick={handleCheckout} className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full" data-testid="checkout-btn">
                Checkout <ArrowRight size={14} className="ml-2" />
              </Button>
              <Link to="/shop" className="block text-center text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors" data-testid="continue-shopping-link">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
