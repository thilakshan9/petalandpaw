import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, ArrowRight, Leaf, Gift, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const WREATH_KIT = {
  id: "wreath_kit",
  name: "Wreath Making Kit",
  price: 24.99,
  image_url: "/images/wreath-kit.jpg",
};

const included = [
  { icon: Leaf, title: "Fresh foliage", text: "A generous bundle of fresh, non-toxic greenery to build your wreath base." },
  { icon: Gift, title: "Festive decorations", text: "Seasonal accents and decorative details to make your wreath uniquely yours." },
  { icon: BookOpen, title: "Step-by-step instructions", text: "Easy guidance so you can create your wreath at home, no experience needed." },
];

export default function WreathKitPage() {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToBasket = () => {
    addToCart({
      product_id: WREATH_KIT.id,
      name: WREATH_KIT.name,
      price: WREATH_KIT.price,
      quantity,
      image_url: WREATH_KIT.image_url,
    });
    toast.success(`${WREATH_KIT.name} added to basket`);
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="wreath-kit-page">
      <SEOHead
        title="Wreath Making Kits"
        description="A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions."
      />
      <div className="container mx-auto px-5 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#F2F0EB] animate-fade-in-up">
            <img src={WREATH_KIT.image_url} alt="Wreath making kit" className="w-full h-full object-cover" />
          </div>

          <div className="animate-fade-in-up delay-50">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 block">Christmas Kit</span>
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
                onClick={handleAddToBasket}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 flex-1"
                data-testid="wreath-kit-add-to-basket-btn"
              >
                <ShoppingBag size={14} className="mr-2" /> Add to Basket
              </Button>
            </div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 mt-4 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors"
              data-testid="wreath-kit-view-basket-link"
            >
              View basket <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <section className="mt-16 md:mt-24" data-testid="wreath-kit-included">
          <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#2C2C2C] mb-8 text-center">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {included.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white border border-[#E5E0D6] rounded-2xl p-6 md:p-8">
                <div className="w-11 h-11 rounded-full bg-[#8DA399]/15 flex items-center justify-center mb-4">
                  <Icon size={18} strokeWidth={1.5} className="text-[#8DA399]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] mb-2">{title}</h3>
                <p className="text-sm font-light text-[#6B7280] leading-[1.6]">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
