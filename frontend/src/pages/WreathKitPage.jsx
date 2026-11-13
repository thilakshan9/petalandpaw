import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ArrowRight, Leaf, Gift, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import WreathKitSlideshow from "@/components/WreathKitSlideshow";
import CheckoutChoiceDialog from "@/components/CheckoutChoiceDialog";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { startStripeCheckout, earliestDeliveryDate, isDeliveryDateTooSoon, toIsoDate } from "@/lib/checkout";

const RETURN_KEY = "pp_return_to_wreath_kit";

function readReturnDetails() {
  try { return JSON.parse(localStorage.getItem(RETURN_KEY)) || {}; } catch { return {}; }
}

const WREATH_KIT = {
  id: "wreath_kit",
  name: "Wreath Making Kit",
  price: 45,
  image_url: "/images/wreath-kit.jpg",
  images: ["/images/wreath-kit.jpg", "/images/wreath-kit-2.jpg", "/images/wreath-kit-3.jpg"],
};

const included = [
  {
    icon: Leaf,
    title: "Frame & foliage",
    items: ["Metal wreath ring", "Moss", "Fresh foliage", "Roll of wire"],
  },
  {
    icon: Gift,
    title: "Decorations",
    items: ["4 pine cones", "9 mini baubles", "4 mini bows", "2 bells", "4 dried orange slices", "Ribbon"],
  },
  {
    icon: BookOpen,
    title: "Step-by-step guide",
    items: ["Written step-by-step instructions", "Video guide, so you can follow along at your own pace"],
  },
];

export default function WreathKitPage() {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [savedDetails] = useState(readReturnDetails);
  const [quantity, setQuantity] = useState(1);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(savedDetails.deliveryDate || "");
  const [phoneNumber, setPhoneNumber] = useState(savedDetails.phoneNumber || "");
  const [fullName, setFullName] = useState(savedDetails.fullName || customer?.name || "");
  const [contactEmail, setContactEmail] = useState(savedDetails.contactEmail || customer?.email || "");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    localStorage.removeItem(RETURN_KEY);
  }, []);

  const validateDetails = () => {
    if (!deliveryDate) {
      toast.error("Please choose your preferred delivery date.");
      return false;
    }
    if (isDeliveryDateTooSoon(deliveryDate)) {
      toast.error("Please choose an estimated delivery date at least 3 days from today.");
      return false;
    }
    if (!fullName.trim()) {
      toast.error("Please enter your name.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number.");
      return false;
    }
    return true;
  };

  const payWithStripe = async () => {
    setPaying(true);
    try {
      await startStripeCheckout([{
        product_id: WREATH_KIT.id,
        name: WREATH_KIT.name,
        price: WREATH_KIT.price,
        quantity,
        image_url: WREATH_KIT.image_url,
      }], { deliveryDate, phoneNumber, fullName, contactEmail });
    } catch (err) {
      toast.error(err.message || "Failed to create checkout session.");
      setPaying(false);
    }
  };

  const handlePayNow = () => {
    if (!validateDetails()) return;
    payWithStripe();
  };

  const handleChoiceSignIn = () => {
    if (customer) {
      setFullName(customer.name || "");
      setContactEmail(customer.email || "");
      setChoiceOpen(false);
      setPaymentOpen(true);
      return;
    }
    localStorage.setItem(RETURN_KEY, JSON.stringify({ deliveryDate, phoneNumber, fullName, contactEmail }));
    navigate("/login");
  };

  const handleChoiceGuest = () => {
    setChoiceOpen(false);
    setPaymentOpen(true);
  };


  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="wreath-kit-page">
      <SEOHead
        title="Wreath Making Kits"
        description="A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions."
      />
      <div className="container mx-auto px-5 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          <WreathKitSlideshow images={WREATH_KIT.images} alt="Wreath making kit" />

          <div className="animate-fade-in-up delay-50">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399]">Christmas Kit</span>
              <span
                className="inline-flex items-center gap-1 bg-[#B8926A]/10 text-[#B8926A] border border-[#B8926A]/30 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full"
                data-testid="wreath-kit-low-stock"
              >
                Low Stock
              </span>
            </div>
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4">
              Wreath Making Kit
            </h1>
            <p className="text-base font-light text-[#6B7280] leading-[1.6] mb-6">
              A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions.
            </p>
            <p className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] mb-8" data-testid="wreath-kit-price">
              £{WREATH_KIT.price.toFixed(2)}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center border border-[#E5E0D6] rounded-full w-fit" data-testid="wreath-kit-quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[#F2F0EB] rounded-l-full transition-colors"
                  aria-label="Decrease quantity"
                  data-testid="wreath-kit-decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm text-[#2C2C2C]" data-testid="wreath-kit-quantity-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 hover:bg-[#F2F0EB] rounded-r-full transition-colors"
                  aria-label="Increase quantity"
                  data-testid="wreath-kit-increase"
                >
                  <Plus size={14} />
                </button>
              </div>
              <Button
                onClick={() => setChoiceOpen(true)}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 flex-1"
                data-testid="wreath-kit-buy-now-btn"
              >
                Buy Now <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 mt-4 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors"
              data-testid="wreath-kit-view-basket-link"
            >
              View basket <ArrowRight size={12} />
            </Link>

            <section className="mt-10 pt-10 border-t border-[#E5E0D6]" data-testid="wreath-kit-included">
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-5">What's Included</h2>
              <div className="space-y-4">
                {included.map(({ icon: Icon, title, items }) => (
                  <div key={title} className="bg-white border border-[#E5E0D6] rounded-2xl p-5 sm:p-6 flex gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#8DA399]/15 flex items-center justify-center">
                      <Icon size={18} strokeWidth={1.5} className="text-[#8DA399]" />
                    </div>
                    <div>
                      <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] mb-2">{title}</h3>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="text-sm font-light text-[#6B7280] leading-[1.6] flex gap-2">
                            <span className="text-[#8DA399]" aria-hidden="true">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Dialog open={paymentOpen} onOpenChange={(v) => !paying && setPaymentOpen(v)}>
        <DialogContent className="max-w-sm border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl" data-testid="wreath-kit-payment-dialog">
          <DialogTitle className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Delivery details</DialogTitle>
          <DialogDescription className="text-sm font-light text-[#6B7280]">
            We need these before you continue to payment.
          </DialogDescription>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Preferred Delivery Date (required)</label>
              <input
                type="date"
                value={deliveryDate}
                min={toIsoDate(earliestDeliveryDate())}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-[#E5E0D6] rounded-lg px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399]"
                data-testid="wreath-kit-delivery-date-input"
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1">Minimum 3 days notice required.</p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Full Name (required)</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-[#E5E0D6] text-sm py-5"
                data-testid="wreath-kit-name-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Email (required)</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="border-[#E5E0D6] text-sm py-5"
                data-testid="wreath-kit-email-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Phone Number (required)</label>
              <Input
                type="tel"
                placeholder="07123 456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border-[#E5E0D6] text-sm py-5"
                data-testid="wreath-kit-phone-input"
              />
            </div>
            <Button
              onClick={handlePayNow}
              disabled={paying}
              className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full"
              data-testid="wreath-kit-pay-now-btn"
            >
              {paying ? "Processing..." : <>Continue to Payment <ArrowRight size={14} className="ml-2" /></>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <CheckoutChoiceDialog
        open={choiceOpen}
        onOpenChange={setChoiceOpen}
        onSignIn={handleChoiceSignIn}
        onGuest={handleChoiceGuest}
      />
    </div>
  );
}
